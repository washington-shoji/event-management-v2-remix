import { useLoaderData, useSearchParams, Link } from '@remix-run/react';
import { json } from '@remix-run/node';
import { requireAuth, getToken } from '~/utils/auth.server';
import { ApiEvent } from '~/types/event';

export async function loader({ request }: { request: Request }) {
	await requireAuth(request);
	const token = await getToken(request);

	try {
		// Fetch events from the API
		const response = await fetch('http://localhost:3000/api/events', {
			headers: {
				'Authorization': `Bearer ${token || ''}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			console.error('Failed to fetch events:', response.status, response.statusText);
			// Return empty events array if API fails
			return json({ events: [] });
		}

		const data = await response.json();

		// Transform API response to match our ApiEvent interface
		// The API returns events as an array directly, not nested under 'events'
		const events: ApiEvent[] = (Array.isArray(data) ? data : data.events || []).map((event: any) => ({
			id: event.id,
			title: event.title,
			description: event.description,
			date: event.eventDate || event.date,
			venue: event.venue?.name || event.venue || 'Unknown Venue',
			organization: event.organization?.name || event.organization || 'Unknown Organization',
			status: event.status || 'upcoming'
		}));

		return json({ events });

	} catch (error) {
		console.error('Error fetching events:', error);
		// Return empty events array on error
		return json({ events: [] });
	}
}

export default function EventsPage() {
	const { events } = useLoaderData<typeof loader>();
	const [searchParams] = useSearchParams();
	const status = searchParams.get('status');

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
					to='/dashboard/events'
					className={`px-4 py-2 rounded-md text-sm font-medium ${
						!status
							? 'bg-indigo-100 text-indigo-700'
							: 'text-gray-500 hover:text-gray-700'
					}`}
				>
					All Events ({events.length})
				</Link>
				<Link
					to='/dashboard/events?status=upcoming'
					className={`px-4 py-2 rounded-md text-sm font-medium ${
						status === 'upcoming'
							? 'bg-indigo-100 text-indigo-700'
							: 'text-gray-500 hover:text-gray-700'
					}`}
				>
					Upcoming Events ({events.filter(e => e.status === 'upcoming').length})
				</Link>
				<Link
					to='/dashboard/events?status=past'
					className={`px-4 py-2 rounded-md text-sm font-medium ${
						status === 'past'
							? 'bg-indigo-100 text-indigo-700'
							: 'text-gray-500 hover:text-gray-700'
					}`}
				>
					Past Events ({events.filter(e => e.status === 'past').length})
				</Link>
			</div>

			{filteredEvents.length === 0 ? (
				<div className='text-center py-12'>
					<div className='text-gray-500'>
						{events.length === 0 ? (
							<>
								<h3 className='text-lg font-medium text-gray-900 mb-2'>No events found</h3>
								<p className='text-gray-500 mb-4'>Get started by creating your first event.</p>
								<Link
									to='/dashboard/event-new'
									className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'
								>
									Create Your First Event
								</Link>
							</>
						) : (
							<>
								<h3 className='text-lg font-medium text-gray-900 mb-2'>No {status} events</h3>
								<p className='text-gray-500'>Try adjusting your filters or create a new event.</p>
							</>
						)}
					</div>
				</div>
			) : (
				<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
					{filteredEvents.map((event: ApiEvent) => (
						<div
							key={event.id}
							className='bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow'
						>
							<div className='px-4 py-5 sm:p-6'>
								<h3 className='text-lg font-medium text-gray-900 mb-2'>
									{event.title}
								</h3>
								<p className='text-sm text-gray-500 mb-4 line-clamp-2'>
									{event.description}
								</p>
								<div className='space-y-2'>
									<p className='text-sm text-gray-500'>
										<span className='font-medium'>Date:</span> {formatDate(event.date)}
									</p>
									<p className='text-sm text-gray-500'>
										<span className='font-medium'>Venue:</span> {event.venue}
									</p>
									<p className='text-sm text-gray-500'>
										<span className='font-medium'>Organization:</span> {event.organization}
									</p>
									<p className='text-sm text-gray-500'>
										<span className='font-medium'>Status:</span>{' '}
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
									</p>
								</div>
								<div className='mt-4 pt-4 border-t border-gray-200'>
									<Link
										to={`/dashboard/event/${event.id}`}
										className='text-indigo-600 hover:text-indigo-900 font-medium'
									>
										View Details →
									</Link>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
