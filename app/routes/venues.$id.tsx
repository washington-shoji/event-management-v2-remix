import { json, ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, Form, Link } from '@remix-run/react';
import { requireAuth } from '~/utils/auth.server';

interface Venue {
	id: string;
	name: string;
	description: string;
	address: string;
	capacity: number;
	amenities: string[];
}

interface Event {
	id: string;
	name: string;
	date: string;
	time: string;
	status: string;
}

export async function loader({
	request,
	params,
}: {
	request: Request;
	params: { id: string };
}) {
	await requireAuth(request);

	// TODO: Fetch venue details from API
	const venue: Venue = {
		id: params.id,
		name: 'Sample Venue',
		description: 'This is a sample venue description',
		address: '123 Main St, City, State 12345',
		capacity: 500,
		amenities: ['Parking', 'WiFi', 'Catering'],
	};

	// TODO: Fetch events for this venue from API
	const events: Event[] = [
		{
			id: '1',
			name: 'Sample Event 1',
			date: '2024-03-15',
			time: '14:00',
			status: 'Scheduled',
		},
		{
			id: '2',
			name: 'Sample Event 2',
			date: '2024-03-20',
			time: '19:00',
			status: 'Scheduled',
		},
	];

	return json({ venue, events });
}

export async function action({ request, params }: ActionFunctionArgs) {
	await requireAuth(request);

	const formData = await request.formData();
	const intent = formData.get('intent');

	if (intent === 'delete') {
		// TODO: Delete venue via API
		return new Response(null, { status: 204 });
	}

	return new Response(null, { status: 400 });
}

export default function VenueDetailPage() {
	const { venue, events } = useLoaderData<typeof loader>();

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-bold text-black'>{venue.name}</h1>
				<div className='flex space-x-3'>
					<Link
						to={`/venues/${venue.id}/edit`}
						className='inline-flex items-center px-4 py-2 border border-black text-sm font-medium rounded-md text-black bg-white hover:bg-black hover:text-white'
					>
						Edit Venue
					</Link>
					<Form method='post'>
						<input type='hidden' name='intent' value='delete' />
						<button
							type='submit'
							className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-black'
						>
							Delete Venue
						</button>
					</Form>
				</div>
			</div>

			<div className='bg-white shadow overflow-hidden sm:rounded-lg border border-black'>
				<div className='px-4 py-5 sm:px-6'>
					<h3 className='text-lg leading-6 font-medium text-black'>
						Venue Information
					</h3>
				</div>
				<div className='border-t border-black'>
					<dl>
						<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-black'>Description</dt>
							<dd className='mt-1 text-sm text-black sm:mt-0 sm:col-span-2'>
								{venue.description}
							</dd>
						</div>
						<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-black'>Address</dt>
							<dd className='mt-1 text-sm text-black sm:mt-0 sm:col-span-2'>
								{venue.address}
							</dd>
						</div>
						<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-black'>Capacity</dt>
							<dd className='mt-1 text-sm text-black sm:mt-0 sm:col-span-2'>
								{venue.capacity}
							</dd>
						</div>
						<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-black'>Amenities</dt>
							<dd className='mt-1 text-sm text-black sm:mt-0 sm:col-span-2'>
								{venue.amenities.join(', ')}
							</dd>
						</div>
					</dl>
				</div>
			</div>

			<div className='bg-white shadow overflow-hidden sm:rounded-lg border border-black'>
				<div className='px-4 py-5 sm:px-6'>
					<h3 className='text-lg leading-6 font-medium text-black'>
						Upcoming Events
					</h3>
				</div>
				<div className='border-t border-black'>
					<ul className='divide-y divide-black'>
						{events.map((event) => (
							<li key={event.id} className='px-4 py-4 sm:px-6'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-sm font-medium text-black truncate'>
											{event.name}
										</p>
										<p className='text-sm text-black'>
											{event.date} at {event.time}
										</p>
									</div>
									<div className='ml-2 flex-shrink-0 flex'>
										<span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-black text-white'>
											{event.status}
										</span>
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
