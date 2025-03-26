import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { requireAuth } from '~/utils/auth.server';

interface Venue {
	id: string;
	name: string;
	description: string;
	address: string;
	capacity: number;
	amenities: string[];
}

export async function loader({ request }: { request: Request }) {
	await requireAuth(request);

	// TODO: Fetch venues from API
	const venues: Venue[] = [
		{
			id: '1',
			name: 'Sample Venue 1',
			description: 'This is a sample venue description',
			address: '123 Main St, City, State 12345',
			capacity: 500,
			amenities: ['Parking', 'WiFi', 'Catering'],
		},
		{
			id: '2',
			name: 'Sample Venue 2',
			description: 'This is another sample venue description',
			address: '456 Oak Ave, City, State 12345',
			capacity: 1000,
			amenities: ['Parking', 'WiFi', 'Catering', 'Stage'],
		},
	];

	return json({ venues });
}

export default function VenuesPage() {
	const { venues } = useLoaderData<typeof loader>();

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-bold text-black'>Venues</h1>
				<Link
					to='/venues/new'
					className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-black'
				>
					Create Venue
				</Link>
			</div>

			<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
				{venues.map((venue) => (
					<div
						key={venue.id}
						className='bg-white overflow-hidden shadow rounded-lg border border-black'
					>
						<div className='px-4 py-5 sm:p-6'>
							<h3 className='text-lg font-medium text-black'>{venue.name}</h3>
							<p className='mt-2 text-sm text-black'>{venue.description}</p>
							<div className='mt-4'>
								<p className='text-sm text-black'>
									<span className='font-medium'>Address:</span> {venue.address}
								</p>
								<p className='text-sm text-black'>
									<span className='font-medium'>Capacity:</span>{' '}
									{venue.capacity}
								</p>
								<p className='text-sm text-black'>
									<span className='font-medium'>Amenities:</span>{' '}
									{venue.amenities.join(', ')}
								</p>
							</div>
							<div className='mt-4'>
								<Link
									to={`/venues/${venue.id}`}
									className='text-black hover:text-black'
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
