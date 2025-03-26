import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';

interface Event {
	id: string;
	title: string;
	description: string;
	date: string;
	venue: string;
	organization: string;
}

export async function loader() {
	// TODO: Fetch featured events from API
	const featuredEvents: Event[] = [
		{
			id: '1',
			title: 'Sample Event 1',
			description: 'This is a sample event description',
			date: '2024-04-01',
			venue: 'Sample Venue 1',
			organization: 'Sample Organization 1',
		},
		{
			id: '2',
			title: 'Sample Event 2',
			description: 'This is another sample event description',
			date: '2024-04-15',
			venue: 'Sample Venue 2',
			organization: 'Sample Organization 2',
		},
	];

	return json({ featuredEvents });
}

export default function Index() {
	const { featuredEvents } = useLoaderData<typeof loader>();

	return (
		<div className='space-y-8'>
			<div className='text-center'>
				<h1 className='text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl'>
					Welcome to Event Management
				</h1>
				<p className='mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl'>
					Discover and manage amazing events in your area. Create, organize, and
					attend events with ease.
				</p>
			</div>

			<div className='mt-12'>
				<h2 className='text-2xl font-bold text-gray-900 mb-6'>
					Featured Events
				</h2>
				<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
					{featuredEvents.map((event) => (
						<div
							key={event.id}
							className='bg-white overflow-hidden shadow rounded-lg'
						>
							<div className='px-4 py-5 sm:p-6'>
								<h3 className='text-lg font-medium text-gray-900'>
									{event.title}
								</h3>
								<p className='mt-2 text-sm text-gray-500'>
									{event.description}
								</p>
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
								</div>
								<div className='mt-4'>
									<Link
										to={`/events/${event.id}`}
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

			<div className='text-center mt-12'>
				<Link
					to='/events'
					className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'
				>
					View All Events
				</Link>
			</div>
		</div>
	);
}
