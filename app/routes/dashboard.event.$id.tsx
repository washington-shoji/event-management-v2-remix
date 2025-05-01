import { ActionFunctionArgs, json } from '@remix-run/node';
import { useLoaderData, Form, Link } from '@remix-run/react';
import { requireAuth, getToken } from '~/utils/auth.server';

// Types for the orchestration API response
interface EventDetailsResponse {
	event: {
		id: string;
		title: string;
		description: string;
		registrationOpenDate: string;
		registrationCloseDate: string;
		eventDate: string;
		venueId: string;
		organizerId: string;
		organizationId: string | null;
		status: string;
		createdAt: string;
		updatedAt: string;
	};
	venue?: {
		id: string;
		name: string;
		description: string;
		capacity: number;
		addressId: string | null;
		status: string;
		createdAt: string;
		updatedAt: string;
	};
	address?: {
		id: string;
		unit: string | null;
		street: string;
		city: string;
		state: string;
		country: string;
		postalCode: string;
		createdAt: string;
		updatedAt: string;
	};
	organization?: {
		id: string;
		name: string;
		description: string;
		type: string;
		status: string;
		addressId: string | null;
		createdAt: string;
		updatedAt: string;
	};
	tickets?: Array<{
		id: string;
		name: string;
		description: string;
		price: string;
		purchasePrice: string;
		quantity: number;
		availableQuantity: number;
		promoCode: string;
		createdAt: string;
		updatedAt: string;
	}>;
	attendeeCount?: number;
}

export async function loader({
	request,
	params,
}: {
	request: Request;
	params: { id: string };
}) {
	await requireAuth(request);
	const token = await getToken(request);

	try {
		// Fetch event details from the orchestration API
		const response = await fetch(`http://localhost:3000/api/events/orchestration/${params.id}/details`, {
			headers: {
				'Authorization': `Bearer ${token || ''}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			if (response.status === 404) {
				throw new Response('Event not found', { status: 404 });
			}
			throw new Response('Failed to fetch event details', { status: response.status });
		}

		const eventDetails: EventDetailsResponse = await response.json();

		return json({ eventDetails });

	} catch (error) {
		console.error('Error fetching event details:', error);
		if (error instanceof Response) {
			throw error;
		}
		throw new Response('Failed to fetch event details', { status: 500 });
	}
}

export async function action({ request }: ActionFunctionArgs) {
	await requireAuth(request);
	const formData = await request.formData();
	const intent = formData.get('intent');

	if (intent === 'delete') {
		// TODO: Delete event from API
		return json({ success: true });
	}

	return json({ success: false });
}

export default function EventDetailPage() {
	const { eventDetails } = useLoaderData<typeof loader>();
	const { event, venue, address, organization, tickets, attendeeCount } = eventDetails;

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

	// Format address for display
	const formatAddress = () => {
		if (!address) return 'Address not available';
		
		const parts = [
			address.unit,
			address.street,
			address.city,
			address.state,
			address.postalCode,
			address.country
		].filter(Boolean);
		
		return parts.join(', ');
	};

	// Get status badge styling
	const getStatusBadge = (status: string) => {
		const statusConfig = {
			'pending': 'bg-yellow-100 text-yellow-800',
			'published': 'bg-green-100 text-green-800',
			'upcoming': 'bg-blue-100 text-blue-800',
			'active': 'bg-green-100 text-green-800',
			'cancelled': 'bg-red-100 text-red-800',
			'completed': 'bg-gray-100 text-gray-800'
		};
		
		return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
	};

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-3xl font-bold text-gray-900'>{event.title}</h1>
					<p className='text-gray-500 mt-1'>Event ID: {event.id}</p>
				</div>
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

			{/* Event Status Badge */}
			<div className='flex items-center space-x-2'>
				<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(event.status)}`}>
					{event.status}
				</span>
				{attendeeCount !== undefined && (
					<span className='text-sm text-gray-500'>
						• {attendeeCount} attendees
					</span>
				)}
			</div>

			{/* Event Information */}
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
							<dt className='text-sm font-medium text-gray-500'>Event Date</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{formatDate(event.eventDate)}
							</dd>
						</div>
						<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Registration Opens</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{formatDate(event.registrationOpenDate)}
							</dd>
						</div>
						<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Registration Closes</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{formatDate(event.registrationCloseDate)}
							</dd>
						</div>
						<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Created</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{formatDate(event.createdAt)}
							</dd>
						</div>
						<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Last Updated</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{formatDate(event.updatedAt)}
							</dd>
						</div>
					</dl>
				</div>
			</div>

			{/* Venue Information */}
			{venue && (
				<div className='bg-white shadow overflow-hidden sm:rounded-lg'>
					<div className='px-4 py-5 sm:px-6'>
						<h3 className='text-lg leading-6 font-medium text-gray-900'>
							Venue Information
						</h3>
					</div>
					<div className='border-t border-gray-200'>
						<dl>
							<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
								<dt className='text-sm font-medium text-gray-500'>Name</dt>
								<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
									{venue.name}
								</dd>
							</div>
							{venue.description && (
								<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
									<dt className='text-sm font-medium text-gray-500'>Description</dt>
									<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
										{venue.description}
									</dd>
								</div>
							)}
							<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
								<dt className='text-sm font-medium text-gray-500'>Capacity</dt>
								<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
									{venue.capacity.toLocaleString()} people
								</dd>
							</div>
							<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
								<dt className='text-sm font-medium text-gray-500'>Status</dt>
								<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
									<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(venue.status)}`}>
										{venue.status}
									</span>
								</dd>
							</div>
							{address && (
								<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
									<dt className='text-sm font-medium text-gray-500'>Address</dt>
									<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
										{formatAddress()}
									</dd>
								</div>
							)}
						</dl>
					</div>
				</div>
			)}

			{/* Organization Information */}
			{organization && (
				<div className='bg-white shadow overflow-hidden sm:rounded-lg'>
					<div className='px-4 py-5 sm:px-6'>
						<h3 className='text-lg leading-6 font-medium text-gray-900'>
							Organization Information
						</h3>
					</div>
					<div className='border-t border-gray-200'>
						<dl>
							<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
								<dt className='text-sm font-medium text-gray-500'>Name</dt>
								<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
									{organization.name}
								</dd>
							</div>
							{organization.description && (
								<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
									<dt className='text-sm font-medium text-gray-500'>Description</dt>
									<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
										{organization.description}
									</dd>
								</div>
							)}
							<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
								<dt className='text-sm font-medium text-gray-500'>Type</dt>
								<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
									<span className='capitalize'>{organization.type}</span>
								</dd>
							</div>
							<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
								<dt className='text-sm font-medium text-gray-500'>Status</dt>
								<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
									<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(organization.status)}`}>
										{organization.status}
									</span>
								</dd>
							</div>
						</dl>
					</div>
				</div>
			)}

			{/* Tickets Information */}
			{tickets && tickets.length > 0 && (
				<div className='bg-white shadow overflow-hidden sm:rounded-lg'>
					<div className='px-4 py-5 sm:px-6'>
						<h3 className='text-lg leading-6 font-medium text-gray-900'>
							Available Tickets
						</h3>
					</div>
					<div className='border-t border-gray-200'>
						<ul className='divide-y divide-gray-200'>
							{tickets.map((ticket) => (
								<li key={ticket.id} className='px-4 py-4 sm:px-6'>
									<div className='flex items-center justify-between'>
										<div className='flex-1'>
											<div className='flex items-center justify-between'>
												<p className='text-sm font-medium text-indigo-600 truncate'>
													{ticket.name}
												</p>
												<p className='text-sm font-medium text-gray-900'>
													${parseFloat(ticket.price).toFixed(2)}
												</p>
											</div>
											{ticket.description && (
												<p className='text-sm text-gray-500 mt-1'>
													{ticket.description}
												</p>
											)}
											<div className='mt-2 flex items-center space-x-4 text-sm text-gray-500'>
												<span>Quantity: {ticket.quantity}</span>
												<span>Available: {ticket.availableQuantity}</span>
												<span>Promo Code: {ticket.promoCode}</span>
											</div>
											{ticket.purchasePrice !== ticket.price && (
												<p className='text-sm text-green-600 mt-1'>
													Purchase Price: ${parseFloat(ticket.purchasePrice).toFixed(2)}
												</p>
											)}
										</div>
										<div className='ml-4 flex-shrink-0 flex'>
											<button
												type='button'
												disabled={ticket.availableQuantity === 0}
												className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md ${
													ticket.availableQuantity > 0
														? 'text-white bg-indigo-600 hover:bg-indigo-700'
														: 'text-gray-400 bg-gray-100 cursor-not-allowed'
												}`}
											>
												{ticket.availableQuantity > 0 ? 'Purchase' : 'Sold Out'}
											</button>
										</div>
									</div>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}

			{/* No Tickets Message */}
			{(!tickets || tickets.length === 0) && (
				<div className='bg-white shadow overflow-hidden sm:rounded-lg'>
					<div className='px-4 py-5 sm:px-6'>
						<h3 className='text-lg leading-6 font-medium text-gray-900'>
							Tickets
						</h3>
					</div>
					<div className='border-t border-gray-200 px-4 py-5 sm:px-6'>
						<p className='text-sm text-gray-500'>No tickets available for this event.</p>
					</div>
				</div>
			)}
		</div>
	);
}
