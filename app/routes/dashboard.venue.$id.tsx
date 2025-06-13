import { json, ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, Form, Link } from '@remix-run/react';
import { requireAuth } from '~/utils/auth.server';
import { getVenueById, deleteVenue, markVenueAsAvailable, markVenueAsUnavailable, markVenueAsMaintenance, markVenueAsClosed } from '~/services/venue.server';
import type { Venue } from '~/types/venue';
import { VenueStatus } from '~/types/venue';

export async function loader({
	request,
	params,
}: {
	request: Request;
	params: { id: string };
}) {
	await requireAuth(request);

	try {
		const venue = await getVenueById(request, params.id);
		return json({ venue });
	} catch (error) {
		console.error('Error loading venue:', error);
		throw new Response('Venue not found', { status: 404 });
	}
}

export async function action({ request, params }: ActionFunctionArgs) {
	await requireAuth(request);

	const formData = await request.formData();
	const intent = formData.get('intent') as string;

	try {
		switch (intent) {
			case 'delete':
				await deleteVenue(request, params.id!);
				return new Response(null, { status: 204 });
			case 'mark-available':
				await markVenueAsAvailable(request, params.id!);
				break;
			case 'mark-unavailable':
				await markVenueAsUnavailable(request, params.id!);
				break;
			case 'mark-maintenance':
				await markVenueAsMaintenance(request, params.id!);
				break;
			case 'mark-closed':
				await markVenueAsClosed(request, params.id!);
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

export default function VenueDetailPage() {
	const { venue } = useLoaderData<typeof loader>();

	function getStatusColor(status: VenueStatus) {
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
				<div className='flex items-center space-x-4'>
					<h1 className='text-2xl font-bold text-gray-900'>{venue.name}</h1>
					{getStatusBadge(venue.status)}
				</div>
				<div className='flex space-x-3'>
					<Link
						to={`/dashboard/venue-edit/${venue.id}`}
						className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black'
					>
						Edit Venue
					</Link>
					{venue.status !== VenueStatus.AVAILABLE && (
						<Form method='post'>
							<input type='hidden' name='intent' value='delete' />
							<button
								type='submit'
								className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
								onClick={(e) => {
									if (!confirm('Are you sure you want to delete this venue?')) {
										e.preventDefault();
									}
								}}
							>
								Delete Venue
							</button>
						</Form>
					)}
				</div>
			</div>

			<div className='bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200'>
				<div className='px-4 py-5 sm:px-6'>
					<h3 className='text-lg leading-6 font-medium text-gray-900'>
						Venue Information
					</h3>
				</div>
				<div className='border-t border-gray-200'>
					<dl>
						<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Description</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{venue.description}
							</dd>
						</div>
						<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Capacity</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{venue.capacity.toLocaleString()}
							</dd>
						</div>
						<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Status</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{getStatusBadge(venue.status)}
							</dd>
						</div>
						{venue.addressId && (
							<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
								<dt className='text-sm font-medium text-gray-500'>Address ID</dt>
								<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
									{venue.addressId}
								</dd>
							</div>
						)}
						<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Created</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{new Date(venue.createdAt).toLocaleDateString()}
							</dd>
						</div>
						<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Last Updated</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{new Date(venue.updatedAt).toLocaleDateString()}
							</dd>
						</div>
					</dl>
				</div>
			</div>

			<div className='bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200'>
				<div className='px-4 py-5 sm:px-6'>
					<h3 className='text-lg leading-6 font-medium text-gray-900'>
						Status Management
					</h3>
				</div>
				<div className='border-t border-gray-200'>
					<div className='px-4 py-5 sm:px-6'>
						<div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
							{venue.status !== VenueStatus.AVAILABLE && (
								<Form method='post' className='inline'>
									<input type='hidden' name='intent' value='mark-available' />
									<button
										type='submit'
										className='w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
									>
										Mark Available
									</button>
								</Form>
							)}

							{venue.status !== VenueStatus.UNAVAILABLE && (
								<Form method='post' className='inline'>
									<input type='hidden' name='intent' value='mark-unavailable' />
									<button
										type='submit'
										className='w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
									>
										Mark Unavailable
									</button>
								</Form>
							)}

							{venue.status !== VenueStatus.MAINTENANCE && (
								<Form method='post' className='inline'>
									<input type='hidden' name='intent' value='mark-maintenance' />
									<button
										type='submit'
										className='w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
									>
										Mark Maintenance
									</button>
								</Form>
							)}

							{venue.status !== VenueStatus.CLOSED && (
								<Form method='post' className='inline'>
									<input type='hidden' name='intent' value='mark-closed' />
									<button
										type='submit'
										className='w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
									>
										Mark Closed
									</button>
								</Form>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
