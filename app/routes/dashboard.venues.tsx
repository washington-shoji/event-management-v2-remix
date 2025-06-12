import { json } from '@remix-run/node';
import { useLoaderData, Link, Form } from '@remix-run/react';
import { requireAuth } from '~/utils/auth.server';
import { getAllVenues, markVenueAsAvailable, markVenueAsUnavailable, markVenueAsMaintenance, markVenueAsClosed, deleteVenue } from '~/services/venue.server';
import { VenueStatus } from '~/types/venue';

export async function loader({ request }: { request: Request }) {
	await requireAuth(request);

	try {
		const venues = await getAllVenues(request);
		return json({ venues });
	} catch (error) {
		console.error('Error loading venues:', error);
		return json({ venues: [] });
	}
}

export async function action({ request }: { request: Request }) {
	await requireAuth(request);

	const formData = await request.formData();
	const intent = formData.get('intent') as string;
	const venueId = formData.get('venueId') as string;

	if (!venueId) {
		return json({ error: 'Venue ID is required' }, { status: 400 });
	}

	try {
		switch (intent) {
			case 'mark-available':
				await markVenueAsAvailable(request, venueId);
				break;
			case 'mark-unavailable':
				await markVenueAsUnavailable(request, venueId);
				break;
			case 'mark-maintenance':
				await markVenueAsMaintenance(request, venueId);
				break;
			case 'mark-closed':
				await markVenueAsClosed(request, venueId);
				break;
			case 'delete':
				await deleteVenue(request, venueId);
				break;
			default:
				return json({ error: 'Invalid intent' }, { status: 400 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error performing venue action:', error);
		return json({ error: 'Failed to perform action' }, { status: 500 });
	}
}

export default function VenuesPage() {
	const { venues } = useLoaderData<typeof loader>();

	const getStatusColor = (status: VenueStatus) => {
		switch (status) {
			case VenueStatus.AVAILABLE:
				return 'bg-green-100 text-green-800';
			case VenueStatus.UNAVAILABLE:
				return 'bg-yellow-100 text-yellow-800';
			case VenueStatus.MAINTENANCE:
				return 'bg-orange-100 text-orange-800';
			case VenueStatus.CLOSED:
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	function getStatusBadge(status: VenueStatus) {
		const colorClass = getStatusColor(status);
		return (
			<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
				{status.charAt(0).toUpperCase() + status.slice(1)}
			</span>
		);
	};

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-bold text-black'>Venues</h1>
				<Link
					to='/dashboard/venue-new'
					className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black'
				>
					Create Venue
				</Link>
			</div>

			<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
				{venues.map((venue) => (
					<div
						key={venue.id}
						className='bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow'
					>
						<div className='px-4 py-5 sm:p-6'>
							<div className='flex justify-between items-start mb-4'>
								<h3 className='text-lg font-medium text-gray-900'>{venue.name}</h3>
								{getStatusBadge(venue.status)}
							</div>
							
							<p className='text-sm text-gray-600 mb-4'>{venue.description}</p>
							
							<div className='space-y-2 mb-4'>
								<p className='text-sm text-gray-600'>
									<span className='font-medium'>Capacity:</span> {venue.capacity.toLocaleString()}
								</p>
								{venue.addressId && (
									<p className='text-sm text-gray-600'>
										<span className='font-medium'>Address ID:</span> {venue.addressId}
									</p>
								)}
								<p className='text-sm text-gray-500'>
									Created: {new Date(venue.createdAt).toLocaleDateString()}
								</p>
							</div>

							<div className='flex justify-between items-center'>
								<Link
									to={`/dashboard/venue/${venue.id}`}
									className='text-black hover:text-gray-700 font-medium text-sm'
								>
									View Details →
								</Link>

								<div className='flex space-x-2'>
									{venue.status !== VenueStatus.AVAILABLE && (
										<Form method='post' className='inline'>
											<input type='hidden' name='intent' value='mark-available' />
											<input type='hidden' name='venueId' value={venue.id} />
											<button
												type='submit'
												className='px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-500'
											>
												Available
											</button>
										</Form>
									)}

									{venue.status !== VenueStatus.UNAVAILABLE && (
										<Form method='post' className='inline'>
											<input type='hidden' name='intent' value='mark-unavailable' />
											<input type='hidden' name='venueId' value={venue.id} />
											<button
												type='submit'
												className='px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none focus:ring-1 focus:ring-yellow-500'
											>
												Unavailable
											</button>
										</Form>
									)}

									{venue.status !== VenueStatus.MAINTENANCE && (
										<Form method='post' className='inline'>
											<input type='hidden' name='intent' value='mark-maintenance' />
											<input type='hidden' name='venueId' value={venue.id} />
											<button
												type='submit'
												className='px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-500'
											>
												Maintenance
											</button>
										</Form>
									)}

									{venue.status !== VenueStatus.CLOSED && (
										<Form method='post' className='inline'>
											<input type='hidden' name='intent' value='mark-closed' />
											<input type='hidden' name='venueId' value={venue.id} />
											<button
												type='submit'
												className='px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-1 focus:ring-red-500'
											>
												Closed
											</button>
										</Form>
									)}

									{venue.status !== VenueStatus.AVAILABLE && (
										<Form method='post' className='inline'>
											<input type='hidden' name='intent' value='delete' />
											<input type='hidden' name='venueId' value={venue.id} />
											<button
												type='submit'
												className='px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-600'
												onClick={(e) => {
													if (!confirm('Are you sure you want to delete this venue?')) {
														e.preventDefault();
													}
												}}
											>
												Delete
											</button>
										</Form>
									)}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{venues.length === 0 && (
				<div className='text-center py-12'>
					<p className='text-gray-500 text-lg'>No venues found.</p>
					<Link
						to='/dashboard/venue-new'
						className='mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800'
					>
						Create your first venue
					</Link>
				</div>
			)}
		</div>
	);
}
