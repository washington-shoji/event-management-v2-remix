import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node';
import { Form, useLoaderData, useActionData, useNavigation, Link } from '@remix-run/react';
import { useState } from 'react';
import { EventDetailsResponse, UpdateEventOrchestrationRequest } from '~/types/event';
import { requireAuth, getToken } from '~/utils/auth.server';



export async function loader({ request, params }: LoaderFunctionArgs) {
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

export async function action({ request, params }: ActionFunctionArgs) {
	const userId = await requireAuth(request);
	const token = await getToken(request);
	const formData = await request.formData();

	try {
		// Parse form data
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const eventDate = formData.get('eventDate') as string;
		const registrationOpenDate = formData.get('registrationOpenDate') as string;
		const registrationCloseDate = formData.get('registrationCloseDate') as string;
		const status = formData.get('status') as string;

		// Build the orchestration request
		const orchestrationRequest: UpdateEventOrchestrationRequest = {};

		// Add event fields if provided
		if (title) orchestrationRequest.title = title;
		if (description) orchestrationRequest.description = description;
		if (eventDate && eventDate.trim()) {
			const eventDateObj = new Date(eventDate);
			if (!isNaN(eventDateObj.getTime())) {
				orchestrationRequest.eventDate = eventDateObj.toISOString();
			}
		}
		if (registrationOpenDate && registrationOpenDate.trim()) {
			const regOpenDateObj = new Date(registrationOpenDate);
			if (!isNaN(regOpenDateObj.getTime())) {
				orchestrationRequest.registrationOpenDate = regOpenDateObj.toISOString();
			}
		}
		if (registrationCloseDate && registrationCloseDate.trim()) {
			const regCloseDateObj = new Date(registrationCloseDate);
			if (!isNaN(regCloseDateObj.getTime())) {
				orchestrationRequest.registrationCloseDate = regCloseDateObj.toISOString();
			}
		}
		if (status) orchestrationRequest.status = status;

		// Handle venue updates
		const updateVenue = formData.get('updateVenue') === 'true';
		if (updateVenue) {
			const venueName = formData.get('venueName') as string;
			const venueCapacity = parseInt(formData.get('venueCapacity') as string);
			const venueDescription = formData.get('venueDescription') as string;
			const venueStatus = formData.get('venueStatus') as string;

			orchestrationRequest.venue = {
				update: true,
				venueData: {}
			};

			if (venueName) orchestrationRequest.venue.venueData!.name = venueName;
			if (venueDescription) orchestrationRequest.venue.venueData!.description = venueDescription;
			if (venueCapacity) orchestrationRequest.venue.venueData!.capacity = venueCapacity;
			if (venueStatus) orchestrationRequest.venue.venueData!.status = venueStatus;
		}

		// Handle ticket management
		const tickets: UpdateEventOrchestrationRequest['tickets'] = {};

		// Parse new tickets
		const newTickets: Array<{
			name: string;
			description?: string;
			price: number;
			purchasePrice: number;
			quantity: number;
			availableQuantity: number;
			promoCode: string;
		}> = [];

		let newTicketIndex = 0;
		while (formData.get(`newTickets[${newTicketIndex}].name`)) {
			const ticketName = formData.get(`newTickets[${newTicketIndex}].name`) as string;
			const ticketDescription = formData.get(`newTickets[${newTicketIndex}].description`) as string;
			const ticketPrice = parseFloat(formData.get(`newTickets[${newTicketIndex}].price`) as string);
			const ticketPurchasePrice = parseFloat(formData.get(`newTickets[${newTicketIndex}].purchasePrice`) as string);
			const ticketQuantity = parseInt(formData.get(`newTickets[${newTicketIndex}].quantity`) as string);
			const ticketPromoCode = formData.get(`newTickets[${newTicketIndex}].promoCode`) as string;

			if (ticketName && !isNaN(ticketPrice) && !isNaN(ticketQuantity) && ticketPromoCode) {
				newTickets.push({
					name: ticketName,
					description: ticketDescription,
					price: ticketPrice,
					purchasePrice: ticketPurchasePrice || ticketPrice * 0.9,
					quantity: ticketQuantity,
					availableQuantity: ticketQuantity,
					promoCode: ticketPromoCode
				});
			}
			newTicketIndex++;
		}

		if (newTickets.length > 0) {
			tickets.create = newTickets;
		}

		// Parse updated tickets
		const updatedTickets: Array<{
			id: string;
			data: {
				name?: string;
				description?: string;
				price?: number;
				purchasePrice?: number;
				quantity?: number;
				availableQuantity?: number;
				promoCode?: string;
			};
		}> = [];

		let updateTicketIndex = 0;
		while (formData.get(`updateTickets[${updateTicketIndex}].id`)) {
			const ticketId = formData.get(`updateTickets[${updateTicketIndex}].id`) as string;
			const ticketName = formData.get(`updateTickets[${updateTicketIndex}].name`) as string;
			const ticketDescription = formData.get(`updateTickets[${updateTicketIndex}].description`) as string;
			const ticketPrice = parseFloat(formData.get(`updateTickets[${updateTicketIndex}].price`) as string);
			const ticketPurchasePrice = parseFloat(formData.get(`updateTickets[${updateTicketIndex}].purchasePrice`) as string);
			const ticketQuantity = parseInt(formData.get(`updateTickets[${updateTicketIndex}].quantity`) as string);
			const ticketAvailableQuantity = parseInt(formData.get(`updateTickets[${updateTicketIndex}].availableQuantity`) as string);
			const ticketPromoCode = formData.get(`updateTickets[${updateTicketIndex}].promoCode`) as string;

			const updateData: any = {};
			if (ticketName) updateData.name = ticketName;
			if (ticketDescription) updateData.description = ticketDescription;
			if (!isNaN(ticketPrice)) updateData.price = ticketPrice;
			if (!isNaN(ticketPurchasePrice)) updateData.purchasePrice = ticketPurchasePrice;
			if (!isNaN(ticketQuantity)) updateData.quantity = ticketQuantity;
			if (!isNaN(ticketAvailableQuantity)) updateData.availableQuantity = ticketAvailableQuantity;
			if (ticketPromoCode) updateData.promoCode = ticketPromoCode;

			if (Object.keys(updateData).length > 0) {
				updatedTickets.push({
					id: ticketId,
					data: updateData
				});
			}
			updateTicketIndex++;
		}

		if (updatedTickets.length > 0) {
			tickets.update = updatedTickets;
		}

		// Parse deleted tickets
		const deletedTicketIds: string[] = [];
		let deleteTicketIndex = 0;
		while (formData.get(`deleteTickets[${deleteTicketIndex}]`)) {
			const ticketId = formData.get(`deleteTickets[${deleteTicketIndex}]`) as string;
			if (ticketId) {
				deletedTicketIds.push(ticketId);
			}
			deleteTicketIndex++;
		}

		if (deletedTicketIds.length > 0) {
			tickets.delete = deletedTicketIds;
		}

		// Add tickets to request if any operations
		if (tickets.create || tickets.update || tickets.delete) {
			orchestrationRequest.tickets = tickets;
		}

		// Call the orchestration API
		const response = await fetch(`http://localhost:3000/api/events/orchestration/${params.id}`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${token || ''}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(orchestrationRequest)
		});

		if (!response.ok) {
			const errorData = await response.json();
			return json({ 
				error: errorData.error || 'Failed to update event',
				details: errorData.details || []
			}, { status: response.status });
		}

		const result = await response.json();
		return json({ success: true, message: 'Event updated successfully' });

	} catch (error) {
		console.error('Error updating event:', error);
		return json({ 
			error: 'An unexpected error occurred while updating the event',
			details: []
		}, { status: 500 });
	}
}

export default function EditEventPage() {
	const { eventDetails } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === 'submitting';
	
	const { event, venue, tickets } = eventDetails;
	
	const [updateVenue, setUpdateVenue] = useState(false);
	const [newTicketCount, setNewTicketCount] = useState(0);
	const [deletedTickets, setDeletedTickets] = useState<Set<string>>(new Set());

	// Format date for datetime-local input
	const formatDateForInput = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
		} catch (error) {
			return '';
		}
	};

	const addNewTicket = () => setNewTicketCount(prev => prev + 1);
	const removeNewTicket = () => setNewTicketCount(prev => Math.max(0, prev - 1));

	const deleteTicket = (ticketId: string) => {
		setDeletedTickets(prev => new Set(prev).add(ticketId));
	};

	const restoreTicket = (ticketId: string) => {
		setDeletedTickets(prev => {
			const newSet = new Set(prev);
			newSet.delete(ticketId);
			return newSet;
		});
	};

	const visibleTickets = tickets?.filter(ticket => !deletedTickets.has(ticket.id)) || [];

	return (
		<div className='max-w-4xl mx-auto p-6'>
			<h1 className='text-3xl font-bold text-gray-900 mb-8'>
				Edit Event: {event.title}
			</h1>

			<Form method='post' className='space-y-8'>
				{/* Basic Event Information */}
				<div className='bg-white p-6 rounded-lg shadow'>
					<h2 className='text-xl font-semibold text-gray-900 mb-4'>Event Details</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div>
							<label htmlFor='title' className='block text-sm font-medium text-gray-700 mb-2'>
								Event Title
							</label>
							<input
								type='text'
								name='title'
								id='title'
								defaultValue={event.title}
								maxLength={512}
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								placeholder='Enter event title'
							/>
						</div>

						<div>
							<label htmlFor='status' className='block text-sm font-medium text-gray-700 mb-2'>
								Status
							</label>
							<select
								name='status'
								id='status'
								defaultValue={event.status}
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							>
								<option value='draft'>Draft</option>
								<option value='pending'>Pending</option>
								<option value='published'>Published</option>
								<option value='scheduled'>Scheduled</option>
								<option value='open'>Open</option>
								<option value='closed'>Closed</option>
								<option value='cancelled'>Cancelled</option>
								<option value='completed'>Completed</option>
							</select>
						</div>

						<div>
							<label htmlFor='eventDate' className='block text-sm font-medium text-gray-700 mb-2'>
								Event Date & Time
							</label>
							<input
								type='datetime-local'
								name='eventDate'
								id='eventDate'
								defaultValue={formatDateForInput(event.eventDate)}
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							/>
						</div>

						<div>
							<label htmlFor='registrationOpenDate' className='block text-sm font-medium text-gray-700 mb-2'>
								Registration Opens
							</label>
							<input
								type='datetime-local'
								name='registrationOpenDate'
								id='registrationOpenDate'
								defaultValue={formatDateForInput(event.registrationOpenDate)}
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							/>
						</div>

						<div>
							<label htmlFor='registrationCloseDate' className='block text-sm font-medium text-gray-700 mb-2'>
								Registration Closes
							</label>
							<input
								type='datetime-local'
								name='registrationCloseDate'
								id='registrationCloseDate'
								defaultValue={formatDateForInput(event.registrationCloseDate)}
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							/>
						</div>

						<div className='md:col-span-2'>
							<label htmlFor='description' className='block text-sm font-medium text-gray-700 mb-2'>
								Description
							</label>
							<textarea
								name='description'
								id='description'
								rows={4}
								defaultValue={event.description}
								maxLength={2048}
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								placeholder='Enter event description'
							/>
						</div>
					</div>
				</div>

				{/* Venue Update Section */}
				{venue && (
					<div className='bg-white p-6 rounded-lg shadow'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='text-xl font-semibold text-gray-900'>Venue Information</h2>
							<label className='flex items-center'>
								<input
									type='checkbox'
									name='updateVenue'
									value='true'
									checked={updateVenue}
									onChange={(e) => setUpdateVenue(e.target.checked)}
									className='mr-2'
								/>
								Update Venue
							</label>
						</div>

						{updateVenue ? (
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<div>
									<label htmlFor='venueName' className='block text-sm font-medium text-gray-700 mb-2'>
										Venue Name
									</label>
									<input
										type='text'
										name='venueName'
										id='venueName'
										defaultValue={venue.name}
										maxLength={256}
										className='w-full px-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										placeholder='Enter venue name'
									/>
								</div>

								<div>
									<label htmlFor='venueCapacity' className='block text-sm font-medium text-gray-700 mb-2'>
										Capacity
									</label>
									<input
										type='number'
										name='venueCapacity'
										id='venueCapacity'
										defaultValue={venue.capacity}
										min={1}
										className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										placeholder='Enter capacity'
									/>
								</div>

								<div>
									<label htmlFor='venueStatus' className='block text-sm font-medium text-gray-700 mb-2'>
										Venue Status
									</label>
									<select
										name='venueStatus'
										id='venueStatus'
										defaultValue={venue.status}
										className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									>
										<option value='available'>Available</option>
										<option value='unavailable'>Unavailable</option>
										<option value='maintenance'>Maintenance</option>
										<option value='closed'>Closed</option>
									</select>
								</div>

								<div className='md:col-span-2'>
									<label htmlFor='venueDescription' className='block text-sm font-medium text-gray-700 mb-2'>
										Venue Description
									</label>
									<textarea
										name='venueDescription'
										id='venueDescription'
										rows={3}
										defaultValue={venue.description}
										maxLength={1024}
										className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										placeholder='Enter venue description'
									/>
								</div>
							</div>
						) : (
							<div className='text-gray-500'>
								<p><strong>Current Venue:</strong> {venue.name}</p>
								<p><strong>Capacity:</strong> {venue.capacity.toLocaleString()} people</p>
								<p><strong>Status:</strong> {venue.status}</p>
							</div>
						)}
					</div>
				)}

				{/* Existing Tickets Section */}
				{visibleTickets.length > 0 && (
					<div className='bg-white p-6 rounded-lg shadow'>
						<h2 className='text-xl font-semibold text-gray-900 mb-4'>Existing Tickets</h2>
						<div className='space-y-6'>
							{visibleTickets.map((ticket, index) => (
								<div key={ticket.id} className='border border-gray-200 rounded-lg p-4'>
									<div className='flex justify-between items-center mb-4'>
										<h3 className='text-lg font-medium text-gray-900'>Ticket {index + 1}</h3>
										<button
											type='button'
											onClick={() => deleteTicket(ticket.id)}
											className='text-red-600 hover:text-red-800 text-sm'
										>
											Delete Ticket
										</button>
									</div>
									
									<input type='hidden' name={`updateTickets[${index}].id`} value={ticket.id} />
									
									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										<div>
											<label htmlFor={`updateTickets[${index}].name`} className='block text-sm font-medium text-gray-700 mb-2'>
												Ticket Name
											</label>
											<input
												type='text'
												name={`updateTickets[${index}].name`}
												id={`updateTickets[${index}].name`}
												defaultValue={ticket.name}
												maxLength={256}
												className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											/>
										</div>

										<div>
											<label htmlFor={`updateTickets[${index}].price`} className='block text-sm font-medium text-gray-700 mb-2'>
												Price ($)
											</label>
											<input
												type='number'
												name={`updateTickets[${index}].price`}
												id={`updateTickets[${index}].price`}
												defaultValue={parseFloat(ticket.price)}
												step='0.01'
												min={0}
												className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											/>
										</div>

										<div>
											<label htmlFor={`updateTickets[${index}].purchasePrice`} className='block text-sm font-medium text-gray-700 mb-2'>
												Purchase Price ($)
											</label>
											<input
												type='number'
												name={`updateTickets[${index}].purchasePrice`}
												id={`updateTickets[${index}].purchasePrice`}
												defaultValue={parseFloat(ticket.purchasePrice)}
												step='0.01'
												min={0}
												className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											/>
										</div>

										<div>
											<label htmlFor={`updateTickets[${index}].quantity`} className='block text-sm font-medium text-gray-700 mb-2'>
												Total Quantity
											</label>
											<input
												type='number'
												name={`updateTickets[${index}].quantity`}
												id={`updateTickets[${index}].quantity`}
												defaultValue={ticket.quantity}
												min={1}
												className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											/>
										</div>

										<div>
											<label htmlFor={`updateTickets[${index}].availableQuantity`} className='block text-sm font-medium text-gray-700 mb-2'>
												Available Quantity
											</label>
											<input
												type='number'
												name={`updateTickets[${index}].availableQuantity`}
												id={`updateTickets[${index}].availableQuantity`}
												defaultValue={ticket.availableQuantity}
												min={0}
												className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											/>
										</div>

										<div>
											<label htmlFor={`updateTickets[${index}].promoCode`} className='block text-sm font-medium text-gray-700 mb-2'>
												Promo Code
											</label>
											<input
												type='text'
												name={`updateTickets[${index}].promoCode`}
												id={`updateTickets[${index}].promoCode`}
												defaultValue={ticket.promoCode}
												maxLength={256}
												className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											/>
										</div>

										<div className='md:col-span-2'>
											<label htmlFor={`updateTickets[${index}].description`} className='block text-sm font-medium text-gray-700 mb-2'>
												Description
											</label>
											<textarea
												name={`updateTickets[${index}].description`}
												id={`updateTickets[${index}].description`}
												rows={2}
												defaultValue={ticket.description}
												maxLength={512}
												className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											/>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Deleted Tickets (for restoration) */}
				{deletedTickets.size > 0 && (
					<div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
						<h3 className='text-lg font-medium text-yellow-800 mb-2'>Deleted Tickets</h3>
						<p className='text-yellow-700 mb-3'>These tickets will be deleted when you save. Click to restore:</p>
						<div className='space-y-2'>
							{Array.from(deletedTickets).map((ticketId) => {
								const ticket = tickets?.find(t => t.id === ticketId);
								return ticket ? (
									<button
										key={ticketId}
										type='button'
										onClick={() => restoreTicket(ticketId)}
										className='block w-full text-left p-2 bg-yellow-100 rounded hover:bg-yellow-200 text-yellow-800'
									>
										{ticket.name} - ${parseFloat(ticket.price).toFixed(2)}
									</button>
								) : null;
							})}
						</div>
					</div>
				)}

				{/* New Tickets Section */}
				<div className='bg-white p-6 rounded-lg shadow'>
					<div className='flex justify-between items-center mb-4'>
						<h2 className='text-xl font-semibold text-gray-900'>Add New Tickets</h2>
						<div className='space-x-2'>
							<button
								type='button'
								onClick={addNewTicket}
								className='px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600'
							>
								Add Ticket
							</button>
							{newTicketCount > 0 && (
								<button
									type='button'
									onClick={removeNewTicket}
									className='px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600'
								>
									Remove Ticket
								</button>
							)}
						</div>
					</div>

					<div className='space-y-6'>
						{Array.from({ length: newTicketCount }, (_, index) => (
							<div key={index} className='border border-gray-200 rounded-lg p-4'>
								<h3 className='text-lg font-medium text-gray-900 mb-4'>New Ticket {index + 1}</h3>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<div>
										<label htmlFor={`newTickets[${index}].name`} className='block text-sm font-medium text-gray-700 mb-2'>
											Ticket Name *
										</label>
										<input
											type='text'
											name={`newTickets[${index}].name`}
											id={`newTickets[${index}].name`}
											required
											maxLength={256}
											className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='e.g., General Admission'
										/>
									</div>

									<div>
										<label htmlFor={`newTickets[${index}].price`} className='block text-sm font-medium text-gray-700 mb-2'>
											Price ($) *
										</label>
										<input
											type='number'
											name={`newTickets[${index}].price`}
											id={`newTickets[${index}].price`}
											required
											step='0.01'
											min={0}
											className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='0.00'
										/>
									</div>

									<div>
										<label htmlFor={`newTickets[${index}].purchasePrice`} className='block text-sm font-medium text-gray-700 mb-2'>
											Purchase Price ($)
										</label>
										<input
											type='number'
											name={`newTickets[${index}].purchasePrice`}
											id={`newTickets[${index}].purchasePrice`}
											step='0.01'
											min={0}
											className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='0.00 (defaults to 90% of price)'
										/>
									</div>

									<div>
										<label htmlFor={`newTickets[${index}].quantity`} className='block text-sm font-medium text-gray-700 mb-2'>
											Quantity *
										</label>
										<input
											type='number'
											name={`newTickets[${index}].quantity`}
											id={`newTickets[${index}].quantity`}
											required
											min={1}
											className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='Enter quantity'
										/>
									</div>

									<div>
										<label htmlFor={`newTickets[${index}].promoCode`} className='block text-sm font-medium text-gray-700 mb-2'>
											Promo Code *
										</label>
										<input
											type='text'
											name={`newTickets[${index}].promoCode`}
											id={`newTickets[${index}].promoCode`}
											required
											maxLength={256}
											className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='e.g., EARLYBIRD2024'
										/>
									</div>

									<div className='md:col-span-2'>
										<label htmlFor={`newTickets[${index}].description`} className='block text-sm font-medium text-gray-700 mb-2'>
											Description
										</label>
										<textarea
											name={`newTickets[${index}].description`}
											id={`newTickets[${index}].description`}
											rows={2}
											maxLength={512}
											className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='Enter ticket description'
										/>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Hidden fields for deleted tickets */}
				{Array.from(deletedTickets).map((ticketId, index) => (
					<input key={index} type='hidden' name={`deleteTickets[${index}]`} value={ticketId} />
				))}

				{/* Error Display */}
				{actionData && 'error' in actionData && actionData.error && (
					<div className='bg-red-50 border border-red-200 rounded-md p-4'>
						<h3 className='text-red-800 font-medium'>Error</h3>
						<p className='text-red-700 mt-1'>{actionData.error}</p>
						{actionData.details && actionData.details.length > 0 && (
							<ul className='text-red-700 mt-2 list-disc list-inside'>
								{actionData.details.map((detail: string, index: number) => (
									<li key={index}>{detail}</li>
								))}
							</ul>
						)}
					</div>
				)}

				{/* Success Display */}
				{actionData && 'success' in actionData && actionData.success && (
					<div className='bg-green-50 border border-green-200 rounded-md p-4'>
						<h3 className='text-green-800 font-medium'>Success</h3>
						<p className='text-green-700 mt-1'>{actionData.message}</p>
					</div>
				)}

				{/* Submit Buttons */}
				<div className='flex justify-end space-x-4'>
					<Link
						to={`/dashboard/event/${event.id}`}
						className='px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
					>
						Cancel
					</Link>
					<button
						type='submit'
						disabled={isSubmitting}
						className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{isSubmitting ? 'Updating Event...' : 'Update Event'}
					</button>
				</div>
			</Form>
		</div>
	);
} 