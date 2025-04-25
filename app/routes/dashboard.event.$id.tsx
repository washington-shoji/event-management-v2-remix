import { ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, Form, Link } from '@remix-run/react';
import { requireAuth } from '~/utils/auth.server';

interface Event {
	id: string;
	title: string;
	description: string;
	date: string;
	venue: string;
	organization: string;
	status: string;
	tickets: Ticket[];
}

interface Ticket {
	id: string;
	name: string;
	price: number;
	quantity: number;
}

export async function loader({
	request,
	params,
}: {
	request: Request;
	params: { id: string };
}) {
	await requireAuth(request);

	// TODO: Fetch event details from API
	const event: Event = {
		id: params.id,
		title: 'Sample Event 1',
		description: 'This is a sample event description',
		date: '2024-04-01',
		venue: 'Sample Venue 1',
		organization: 'Sample Organization 1',
		status: 'upcoming',
		tickets: [
			{
				id: '1',
				name: 'General Admission',
				price: 50,
				quantity: 100,
			},
			{
				id: '2',
				name: 'VIP',
				price: 100,
				quantity: 50,
			},
		],
	};

	return Response.json({ event });
}

export async function action({ request }: ActionFunctionArgs) {
	await requireAuth(request);
	const formData = await request.formData();
	const intent = formData.get('intent');

	if (intent === 'delete') {
		// TODO: Delete event from API
		return Response.json({ success: true });
	}

	return Response.json({ success: false });
}

export default function EventDetailPage() {
	const { event } = useLoaderData<typeof loader>();

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-bold text-gray-900'>{event.title}</h1>
				<div className='flex space-x-4'>
					<Link
						to={`/dashboard/event-edit/${event.id}`}
						className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
					>
						Edit Event
					</Link>
					<Form method='post'>
						<input type='hidden' name='intent' value='delete' />
						<button
							type='submit'
							className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700'
						>
							Delete Event
						</button>
					</Form>
				</div>
			</div>

			<div className='bg-white shadow overflow-hidden sm:rounded-lg'>
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
							<dt className='text-sm font-medium text-gray-500'>Date</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{event.date}
							</dd>
						</div>
						<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Venue</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{event.venue}
							</dd>
						</div>
						<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>
								Organization
							</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{event.organization}
							</dd>
						</div>
						<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Status</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								<span
									className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
										event.status === 'upcoming'
											? 'bg-green-100 text-green-800'
											: 'bg-gray-100 text-gray-800'
									}`}
								>
									{event.status}
								</span>
							</dd>
						</div>
					</dl>
				</div>
			</div>

			<div className='bg-white shadow overflow-hidden sm:rounded-lg'>
				<div className='px-4 py-5 sm:px-6'>
					<h3 className='text-lg leading-6 font-medium text-gray-900'>
						Available Tickets
					</h3>
				</div>
				<div className='border-t border-gray-200'>
					<ul className='divide-y divide-gray-200'>
						{event.tickets.map((ticket: Ticket) => (
							<li key={ticket.id} className='px-4 py-4 sm:px-6'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-sm font-medium text-indigo-600 truncate'>
											{ticket.name}
										</p>
										<p className='text-sm text-gray-500'>
											${ticket.price} - {ticket.quantity} available
										</p>
									</div>
									<div className='ml-2 flex-shrink-0 flex'>
										<button
											type='button'
											className='inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700'
										>
											Purchase
										</button>
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}
