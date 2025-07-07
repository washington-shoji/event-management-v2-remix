import { json, ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, useSearchParams, Link, Form } from '@remix-run/react';
import { requireAuth } from '~/utils/auth.server';
import { getEventsForRegistration } from '~/services/event.server';
import { registerForEvent, getUserEventRegistrations } from '~/services/eventAttendee.server';
import type { ApiEvent } from '~/types/event';

export async function loader({ request }: { request: Request }) {
	const userId = await requireAuth(request);

	try {
		// Fetch events available for registration
		const events = await getEventsForRegistration(request, userId);
		
		// Fetch user's existing registrations to show registration status
		const userRegistrations = await getUserEventRegistrations(request, userId);
		
		return json({ events, userRegistrations });
	} catch (error) {
		console.error('Error loading public events:', error);
		return json({ events: [], userRegistrations: [] });
	}
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireAuth(request);
	const formData = await request.formData();
	const intent = formData.get('intent') as string;

	try {
		switch (intent) {
			case 'register':
				const eventId = formData.get('eventId') as string;
				if (!eventId) {
					return json({ error: 'Event ID is required' }, { status: 400 });
				}

				await registerForEvent(request, {
					eventId,
					userId,
					status: 'registered'
				});

				return json({ success: true });
			default:
				return json({ error: 'Invalid intent' }, { status: 400 });
		}
	} catch (error) {
		console.error('Error performing event action:', error);
		return json({ error: 'Failed to perform action' }, { status: 500 });
	}
}

export default function PublicEventsPage() {
	const { events, userRegistrations } = useLoaderData<typeof loader>();
	const [searchParams] = useSearchParams();
	const status = searchParams.get('status');

	// Create a map of user registrations for quick lookup
	const userRegistrationMap = new Map(
		userRegistrations.map(registration => [registration.eventId, registration])
	);

	const filteredEvents = status
		? events.filter((event: ApiEvent) => event.status === status)
		: events;

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

	// Check if user is registered for an event
	const isUserRegistered = (eventId: string) => {
		const registration = userRegistrationMap.get(eventId);
		return registration && registration.status !== 'cancelled';
	};

	// Get registration status for an event
	const getRegistrationStatus = (eventId: string) => {
		const registration = userRegistrationMap.get(eventId);
		return registration?.status || null;
	};

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-bold text-gray-900'>Public Events</h1>
				<Link
					to='/dashboard/events'
					className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
				>
					My Events
				</Link>
			</div>

			<div className='flex space-x-4'>
				<Link
					to='/dashboard/public-events'
					className={`px-4 py-2 rounded-md text-sm font-medium ${
						!status
							? 'bg-blue-100 text-blue-700'
							: 'text-gray-500 hover:text-gray-700'
					}`}
				>
					All Events ({events.length})
				</Link>
				<Link
					to='/dashboard/public-events?status=upcoming'
					className={`px-4 py-2 rounded-md text-sm font-medium ${
						status === 'upcoming'
							? 'bg-blue-100 text-blue-700'
							: 'text-gray-500 hover:text-gray-700'
					}`}
				>
					Upcoming Events ({events.filter(e => e.status === 'upcoming').length})
				</Link>
				<Link
					to='/dashboard/public-events?status=published'
					className={`px-4 py-2 rounded-md text-sm font-medium ${
						status === 'published'
							? 'bg-blue-100 text-blue-700'
							: 'text-gray-500 hover:text-gray-700'
					}`}
				>
					Published Events ({events.filter(e => e.status === 'published').length})
				</Link>
			</div>

			{filteredEvents.length === 0 ? (
				<div className='text-center py-12'>
					<div className='text-gray-500'>
						{events.length === 0 ? (
							<>
								<h3 className='text-lg font-medium text-gray-900 mb-2'>No events available</h3>
								<p className='text-gray-500 mb-4'>There are no events available for registration at this time.</p>
							</>
						) : (
							<>
								<h3 className='text-lg font-medium text-gray-900 mb-2'>No {status} events</h3>
								<p className='text-gray-500'>Try adjusting your filters.</p>
							</>
						)}
					</div>
				</div>
			) : (
				<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
					{filteredEvents.map((event: ApiEvent) => {
						const isRegistered = isUserRegistered(event.id);
						const registrationStatus = getRegistrationStatus(event.id);

						return (
							<div
								key={event.id}
								className='bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow border border-gray-200'
							>
								<div className='px-4 py-5 sm:p-6'>
									<div className='flex justify-between items-start mb-4'>
										<h3 className='text-lg font-medium text-gray-900'>{event.title}</h3>
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
									
									<p className='text-sm text-gray-600 mb-4 line-clamp-2'>
										{event.description}
									</p>
									
									<div className='space-y-2 mb-4'>
										<p className='text-sm text-gray-600'>
											<span className='font-medium'>Date:</span> {formatDate(event.date)}
										</p>
									</div>

									<div className='flex justify-between items-center'>
										<Link
											to={`/dashboard/public-event/${event.id}`}
											className='text-blue-600 hover:text-blue-900 font-medium text-sm'
										>
											View Details →
										</Link>

										{isRegistered ? (
											<div className='flex items-center space-x-2'>
												<span className='text-sm text-green-600 font-medium'>
													{registrationStatus === 'registered' && 'Registered'}
													{registrationStatus === 'checked_in' && 'Checked In'}
													{registrationStatus === 'completed' && 'Completed'}
												</span>
												<Form method='post' className='inline'>
													<input type='hidden' name='intent' value='cancel' />
													<input type='hidden' name='eventId' value={event.id} />
													<button
														type='submit'
														className='px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-1 focus:ring-red-500'
														onClick={(e) => {
															if (!confirm('Are you sure you want to cancel your registration?')) {
																e.preventDefault();
															}
														}}
													>
														Cancel
													</button>
												</Form>
											</div>
										) : (
											<Form method='post' className='inline'>
												<input type='hidden' name='intent' value='register' />
												<input type='hidden' name='eventId' value={event.id} />
												<button
													type='submit'
													className='px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
												>
													Register
												</button>
											</Form>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
} 