import { useLoaderData, useSearchParams, Link } from '@remix-run/react';
import { requireAuth } from '~/utils/auth.server';
import { ApiEvent } from '~/types/event';

export async function loader({ request }: { request: Request }) {
	await requireAuth(request);

	// TODO: Fetch events from API with pagination and filters
	const events: ApiEvent[] = [
		{
			id: '1',
			title: 'Sample Event 1',
			description: 'This is a sample event description',
			date: '2024-04-01',
			venue: 'Sample Venue 1',
			organization: 'Sample Organization 1',
			status: 'upcoming',
		},
		{
			id: '2',
			title: 'Sample Event 2',
			description: 'This is another sample event description',
			date: '2024-04-15',
			venue: 'Sample Venue 2',
			organization: 'Sample Organization 2',
			status: 'upcoming',
		},
		{
			id: '3',
			title: 'Past Event 1',
			description: 'This is a past event',
			date: '2024-03-01',
			venue: 'Sample Venue 3',
			organization: 'Sample Organization 3',
			status: 'past',
		},
	];

	return Response.json({ events });
}

export default function EventsPage() {
	const { events } = useLoaderData<typeof loader>();
	const [searchParams] = useSearchParams();
	const status = searchParams.get('status');

	const filteredEvents = status
		? events.filter((event: ApiEvent) => event.status === status)
		: events;

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-bold text-gray-900'>Events</h1>
				<Link
					to='/dashboard/event-new'
					className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'
				>
					Create Event
				</Link>
			</div>

			<div className='flex space-x-4'>
				<Link
					to='/events'
					className={`px-4 py-2 rounded-md text-sm font-medium ${
						!status
							? 'bg-indigo-100 text-indigo-700'
							: 'text-gray-500 hover:text-gray-700'
					}`}
				>
					All Events
				</Link>
				<Link
					to='/events?status=upcoming'
					className={`px-4 py-2 rounded-md text-sm font-medium ${
						status === 'upcoming'
							? 'bg-indigo-100 text-indigo-700'
							: 'text-gray-500 hover:text-gray-700'
					}`}
				>
					Upcoming Events
				</Link>
				<Link
					to='/events?status=past'
					className={`px-4 py-2 rounded-md text-sm font-medium ${
						status === 'past'
							? 'bg-indigo-100 text-indigo-700'
							: 'text-gray-500 hover:text-gray-700'
					}`}
				>
					Past Events
				</Link>
			</div>

			<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
				{filteredEvents.map((event: ApiEvent) => (
					<div
						key={event.id}
						className='bg-white overflow-hidden shadow rounded-lg'
					>
						<div className='px-4 py-5 sm:p-6'>
							<h3 className='text-lg font-medium text-gray-900'>
								{event.title}
							</h3>
							<p className='mt-2 text-sm text-gray-500'>{event.description}</p>
							<div className='mt-4'>
								<p className='text-sm text-gray-500'>
									<span className='font-medium'>Date:</span> {event.date}
								</p>
								<p className='text-sm text-gray-500'>
									<span className='font-medium'>Venue:</span> {event.venue}
								</p>
								<p className='text-sm text-gray-500'>
									<span className='font-medium'>Organization:</span>{' '}
									{event.organization}
								</p>
								<p className='text-sm text-gray-500'>
									<span className='font-medium'>Status:</span>{' '}
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
											event.status === 'upcoming'
												? 'bg-green-100 text-green-800'
												: 'bg-gray-100 text-gray-800'
										}`}
									>
										{event.status}
									</span>
								</p>
							</div>
							<div className='mt-4'>
								<Link
									to={`/dashboard/event/${event.id}`}
									className='text-indigo-600 hover:text-indigo-900'
								>
									View Details →
								</Link>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
