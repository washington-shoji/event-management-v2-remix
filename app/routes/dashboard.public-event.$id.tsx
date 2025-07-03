import { json, ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, Form, Link } from '@remix-run/react';
import { requireAuth } from '~/utils/auth.server';
import { getEventById } from '~/services/event.server';
import { registerForEvent, getUserEventRegistrations, cancelRegistration } from '~/services/eventAttendee.server';
import type { ApiEvent } from '~/types/event';
import type { EventAttendee } from '~/services/eventAttendee.server';

export async function loader({
	request,
	params,
}: {
	request: Request;
	params: { id: string };
}) {
	const userId = await requireAuth(request);

	try {
		// Fetch event details
		const event = await getEventById(request, params.id);
		
		// Fetch user's registrations to check if they're registered for this event
		const userRegistrations = await getUserEventRegistrations(request, userId);
		const userRegistration = userRegistrations.find(reg => reg.eventId === params.id);
		
		return json({ event, userRegistration });
	} catch (error) {
		console.error('Error loading public event:', error);
		throw new Response('Event not found', { status: 404 });
	}
}

export async function action({ request, params }: ActionFunctionArgs) {
	const userId = await requireAuth(request);
	const formData = await request.formData();
	const intent = formData.get('intent') as string;

	try {
		switch (intent) {
			case 'register':
				await registerForEvent(request, {
					eventId: params.id!,
					userId,
					status: 'registered'
				});
				return json({ success: true });
			case 'cancel':
				const registrationId = formData.get('registrationId') as string;
				if (!registrationId) {
					return json({ error: 'Registration ID is required' }, { status: 400 });
				}
				await cancelRegistration(request, registrationId);
				return json({ success: true });
			default:
				return json({ error: 'Invalid intent' }, { status: 400 });
		}
	} catch (error) {
		console.error('Error performing event action:', error);
		return json({ error: 'Failed to perform action' }, { status: 500 });
	}
}

export default function PublicEventDetailPage() {
	const { event, userRegistration } = useLoaderData<typeof loader>();

	// Format date for display
	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch (error) {
			return dateString;
		}
	};

	// Check if user is registered
	const isRegistered = userRegistration && userRegistration.status !== 'cancelled';

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div className='flex items-center space-x-4'>
					<h1 className='text-2xl font-bold text-gray-900'>{event.title}</h1>
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
							event.status === 'upcoming'
								? 'bg-green-100 text-green-800'
								: event.status === 'published'
								? 'bg-blue-100 text-blue-800'
								: 'bg-gray-100 text-gray-800'
						}`}
					>
						{event.status}
					</span>
				</div>
				<Link
					to='/dashboard/public-events'
					className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
				>
					Back to Events
				</Link>
			</div>

			<div className='bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200'>
				<div className='px-4 py-5 sm:px-6'>
					<h3 className='text-lg leading-6 font-medium text-gray-900'>
						Event Information
					</h3>
				</div>
				<div className='border-t border-gray-200'>
					<dl>
						<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Description</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{event.description}
							</dd>
						</div>
						<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Event Date</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{formatDate(event.date)}
							</dd>
						</div>
						<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Venue</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{event.venue}
							</dd>
						</div>
						<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Organization</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{event.organization}
							</dd>
						</div>
					</dl>
				</div>
			</div>

			{/* Registration Section */}
			<div className='bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200'>
				<div className='px-4 py-5 sm:px-6'>
					<h3 className='text-lg leading-6 font-medium text-gray-900'>
						Registration
					</h3>
				</div>
				<div className='border-t border-gray-200'>
					<div className='px-4 py-5 sm:px-6'>
						{isRegistered ? (
							<div className='space-y-4'>
								<div className='flex items-center space-x-2'>
									<span className='text-sm text-green-600 font-medium'>
										{userRegistration?.status === 'registered' && '✓ Registered for this event'}
										{userRegistration?.status === 'checked_in' && '✓ Checked in'}
										{userRegistration?.status === 'completed' && '✓ Completed'}
									</span>
								</div>
								<p className='text-sm text-gray-600'>
									Registration Date: {userRegistration && formatDate(userRegistration.registrationDate)}
								</p>
								<Form method='post'>
									<input type='hidden' name='intent' value='cancel' />
									<input type='hidden' name='registrationId' value={userRegistration?.id} />
									<button
										type='submit'
										className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
										onClick={(e) => {
											if (!confirm('Are you sure you want to cancel your registration?')) {
												e.preventDefault();
											}
										}}
									>
										Cancel Registration
									</button>
								</Form>
							</div>
						) : (
							<div className='space-y-4'>
								<p className='text-sm text-gray-600'>
									You are not registered for this event. Click the button below to register.
								</p>
								<Form method='post'>
									<input type='hidden' name='intent' value='register' />
									<button
										type='submit'
										className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
									>
										Register for Event
									</button>
								</Form>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Additional Information */}
			<div className='bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200'>
				<div className='px-4 py-5 sm:px-6'>
					<h3 className='text-lg leading-6 font-medium text-gray-900'>
						Additional Information
					</h3>
				</div>
				<div className='border-t border-gray-200'>
					<div className='px-4 py-5 sm:px-6'>
						<div className='space-y-4'>
							<div>
								<h4 className='text-sm font-medium text-gray-900'>Event Details</h4>
								<p className='text-sm text-gray-600 mt-1'>
									This is a public event open for registration. Please arrive on time and bring any required materials.
								</p>
							</div>
							<div>
								<h4 className='text-sm font-medium text-gray-900'>Contact Information</h4>
								<p className='text-sm text-gray-600 mt-1'>
									For questions about this event, please contact the organizing team.
								</p>
							</div>
							<div>
								<h4 className='text-sm font-medium text-gray-900'>Cancellation Policy</h4>
								<p className='text-sm text-gray-600 mt-1'>
									You can cancel your registration up to 24 hours before the event starts.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
} 