import { json, ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, Form, Link } from '@remix-run/react';
import { requireAuth } from '~/utils/auth.server';
import { getEventById } from '~/services/event.server';
import { registerForEvent, getUserEventRegistrations, cancelRegistration, getAttendeeTickets, purchaseTickets, cancelTicketPurchase, updateTicketQuantity, type AttendeeTicket } from '~/services/eventAttendee.server';

export async function loader({
	request,
	params,
}: {
	request: Request;
	params: { id: string };
}) {
	const userId = await requireAuth(request);

	try {
		// Fetch event details
		const event = await getEventById(request, params.id);
		
		// Fetch user's registrations to check if they're registered for this event
		const userRegistrations = await getUserEventRegistrations(request, userId);
		const userRegistration = userRegistrations.find(reg => reg.eventId === params.id);
		
		// If user is registered, fetch their tickets
		let userTickets: AttendeeTicket[] = [];
		if (userRegistration) {
			try {
				userTickets = await getAttendeeTickets(request, userRegistration.id);
			} catch (error) {
				console.error('Error fetching user tickets:', error);
				// Continue without tickets if there's an error
			}
		}
		
		return json({ event, userRegistration, userTickets });
	} catch (error) {
		console.error('Error loading public event:', error);
		throw new Response('Event not found', { status: 404 });
	}
}

export async function action({ request, params }: ActionFunctionArgs) {
	const userId = await requireAuth(request);
	const formData = await request.formData();
	const intent = formData.get('intent') as string;

	try {
		switch (intent) {
			case 'register':
				await registerForEvent(request, {
					eventId: params.id!,
					userId,
					status: 'registered'
				});
				return json({ success: true });
			case 'purchase_tickets':
				const attendeeId = formData.get('attendeeId') as string;
				const ticketId = formData.get('ticketId') as string;
				const quantity = parseInt(formData.get('quantity') as string);
				
				if (!attendeeId || !ticketId || isNaN(quantity)) {
					return json({ error: 'Missing required ticket purchase information' }, { status: 400 });
				}
				
				// Validate quantity limits
				if (quantity <= 0) {
					return json({ error: 'Quantity must be greater than 0' }, { status: 400 });
				}
				
				if (quantity > 20) {
					return json({ error: 'Maximum 20 tickets allowed per purchase' }, { status: 400 });
				}
				
				await purchaseTickets(request, {
					attendeeId,
					ticketId,
					quantity
				});
				return json({ success: true });
			case 'update_ticket_quantity':
				const ticketPurchaseId = formData.get('ticketPurchaseId') as string;
				const newQuantity = parseInt(formData.get('quantity') as string);
				
				if (!ticketPurchaseId || isNaN(newQuantity)) {
					return json({ error: 'Missing required ticket update information' }, { status: 400 });
				}
				
				// Validate quantity limits
				if (newQuantity <= 0) {
					return json({ error: 'Quantity must be greater than 0' }, { status: 400 });
				}
				
				if (newQuantity > 20) {
					return json({ error: 'Maximum 20 tickets allowed per purchase' }, { status: 400 });
				}
				
				await updateTicketQuantity(request, ticketPurchaseId, { quantity: newQuantity });
				return json({ success: true });
			case 'cancel_ticket':
				const ticketIdToCancel = formData.get('ticketPurchaseId') as string;
				if (!ticketIdToCancel) {
					return json({ error: 'Ticket purchase ID is required' }, { status: 400 });
				}
				await cancelTicketPurchase(request, ticketIdToCancel);
				return json({ success: true });
			case 'cancel':
				const registrationId = formData.get('registrationId') as string;
				if (!registrationId) {
					return json({ error: 'Registration ID is required' }, { status: 400 });
				}
				await cancelRegistration(request, registrationId);
				return json({ success: true });
			default:
				return json({ error: 'Invalid intent' }, { status: 400 });
		}
	} catch (error) {
		console.error('Error performing event action:', error);
		return json({ error: 'Failed to perform action' }, { status: 500 });
	}
}

export default function PublicEventDetailPage() {
	const { event, userRegistration, userTickets } = useLoaderData<typeof loader>();

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

	// Check if user is registered
	const isRegistered = userRegistration && userRegistration.status !== 'cancelled';

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div className='flex items-center space-x-4'>
					<h1 className='text-2xl font-bold text-gray-900'>{event.title}</h1>
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
				<Link
					to='/dashboard/public-events'
					className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
				>
					Back to Events
				</Link>
			</div>

			<div className='bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200'>
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
								{formatDate(event.date)}
							</dd>
						</div>
						<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Venue</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{event.venue}
							</dd>
						</div>
						<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Organization</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{event.organization}
							</dd>
						</div>
						{event.attendeeCount !== undefined && (
							<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
								<dt className='text-sm font-medium text-gray-500'>Registered Attendees</dt>
								<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
									{event.attendeeCount} people
								</dd>
							</div>
						)}
					</dl>
				</div>
			</div>

			{/* Tickets Section */}
			{event.tickets && event.tickets.length > 0 && (
				<div className='bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200'>
					<div className='px-4 py-5 sm:px-6'>
						<h3 className='text-lg leading-6 font-medium text-gray-900'>
							Available Tickets
						</h3>
					</div>
					<div className='border-t border-gray-200'>
						<div className='px-4 py-5 sm:px-6'>
							<div className='space-y-4'>
								{event.tickets.map((ticket) => {
									// Find if user has purchased this ticket type
									const userTicket = userTickets.find(ut => ut.ticketId === ticket.id);
									
									return (
										<div key={ticket.id} className='border border-gray-200 rounded-lg p-4'>
											<div className='flex justify-between items-start'>
												<div className='flex-1'>
													<h4 className='text-lg font-medium text-gray-900'>{ticket.name}</h4>
													{ticket.description && (
														<p className='w-full sm:w-1/2 text-sm text-gray-600 mt-1'>{ticket.description}</p>
													)}
													<div className='mt-2 flex items-center space-x-4 text-sm text-gray-500'>
														<span>Price: ${ticket.price}</span>
														<span>Available: {ticket.availableQuantity} of {ticket.quantity}</span>
														<span className='text-blue-600'>Max 20 tickets per purchase</span>
														{ticket.promoCode && (
															<span>Promo Code: {ticket.promoCode}</span>
														)}
													</div>
													{userTicket && (
														<div className='mt-2 p-2 bg-green-50 border border-green-200 rounded'>
															<p className='text-sm text-green-800'>
																✓ You have purchased {userTicket.quantity} ticket(s)
															</p>
														</div>
													)}
												</div>
												<div className='ml-4'>
													<span className='text-lg font-bold text-gray-900'>${ticket.price}</span>
													{ticket.availableQuantity > 0 ? (
														<span className='block text-sm text-green-600'>Available</span>
													) : (
														<span className='block text-sm text-red-600'>Sold Out</span>
													)}
												</div>
											</div>
											
											{/* Ticket Purchase/Management Actions */}
											{isRegistered && ticket.availableQuantity > 0 && (
												<div className='mt-4 pt-4 border-t border-gray-200'>
													{userTicket ? (
														<div className='flex items-center space-x-4'>
															<span className='text-sm text-gray-600'>
																Quantity: {userTicket.quantity}
															</span>
															<Form method='post' className='flex items-center space-x-2'>
																<input type='hidden' name='intent' value='update_ticket_quantity' />
																<input type='hidden' name='ticketPurchaseId' value={userTicket.id} />
																<input
																	type='number'
																	name='quantity'
																	min='1'
																	max={Math.min(ticket.availableQuantity + userTicket.quantity, 20)}
																	defaultValue={userTicket.quantity}
																	className='px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
																/>
																<button
																	type='submit'
																	className='px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700'
																>
																	Update
																</button>
															</Form>
															<Form method='post' className='inline'>
																<input type='hidden' name='intent' value='cancel_ticket' />
																<input type='hidden' name='ticketPurchaseId' value={userTicket.id} />
																<button
																	type='submit'
																	className='px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700'
																	onClick={(e) => {
																		if (!confirm('Are you sure you want to cancel this ticket purchase?')) {
																			e.preventDefault();
																		}
																	}}
																>
																	Cancel
																</button>
															</Form>
														</div>
													) : (
														<Form method='post' className='flex items-center space-x-2'>
															<input type='hidden' name='intent' value='purchase_tickets' />
															<input type='hidden' name='attendeeId' value={userRegistration?.id} />
															<input type='hidden' name='ticketId' value={ticket.id} />
															<input
																type='number'
																name='quantity'
																min='1'
																max={Math.min(ticket.availableQuantity, 20)}
																defaultValue='1'
																className='w-1/2 sm:w-3/12 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
															/>
															<button
																type='submit'
																className='px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700'
															>
																Purchase Tickets
															</button>
														</Form>
													)}
												</div>
											)}
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Registration Section */}
			<div className='bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200'>
				<div className='px-4 py-5 sm:px-6'>
					<h3 className='text-lg leading-6 font-medium text-gray-900'>
						Registration
					</h3>
				</div>
				<div className='border-t border-gray-200'>
					<div className='px-4 py-5 sm:px-6'>
						{isRegistered ? (
							<div className='space-y-4'>
								<div className='flex items-center space-x-2'>
									<span className='text-sm text-green-600 font-medium'>
										{userRegistration?.status === 'registered' && '✓ Registered for this event'}
										{userRegistration?.status === 'checked_in' && '✓ Checked in'}
										{userRegistration?.status === 'completed' && '✓ Completed'}
									</span>
								</div>
								<p className='text-sm text-gray-600'>
									Registration Date: {userRegistration && formatDate(userRegistration.registrationDate)}
								</p>
								<Form method='post'>
									<input type='hidden' name='intent' value='cancel' />
									<input type='hidden' name='registrationId' value={userRegistration?.id} />
									<button
										type='submit'
										className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
										onClick={(e) => {
											if (!confirm('Are you sure you want to cancel your registration?')) {
												e.preventDefault();
											}
										}}
									>
										Cancel Registration
									</button>
								</Form>
							</div>
						) : (
							<div className='space-y-4'>
								<p className='text-sm text-gray-600'>
									You are not registered for this event. Click the button below to register.
								</p>
								<Form method='post'>
									<input type='hidden' name='intent' value='register' />
									<button
										type='submit'
										className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
									>
										Register for Event
									</button>
								</Form>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Additional Information */}
			<div className='bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200'>
				<div className='px-4 py-5 sm:px-6'>
					<h3 className='text-lg leading-6 font-medium text-gray-900'>
						Additional Information
					</h3>
				</div>
				<div className='border-t border-gray-200'>
					<div className='px-4 py-5 sm:px-6'>
						<div className='space-y-4'>
							<div>
								<h4 className='text-sm font-medium text-gray-900'>Event Details</h4>
								<p className='text-sm text-gray-600 mt-1'>
									This is a public event open for registration. Please arrive on time and bring any required materials.
								</p>
							</div>
							<div>
								<h4 className='text-sm font-medium text-gray-900'>Contact Information</h4>
								<p className='text-sm text-gray-600 mt-1'>
									For questions about this event, please contact the organizing team.
								</p>
							</div>
							<div>
								<h4 className='text-sm font-medium text-gray-900'>Cancellation Policy</h4>
								<p className='text-sm text-gray-600 mt-1'>
									You can cancel your registration up to 24 hours before the event starts.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
} 