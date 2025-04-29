import { ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { useState } from 'react';
import { CreateEventOrchestrationRequest, CreateEventOrchestrationResponse } from '~/types/event';
import { requireAuth, getToken } from '~/utils/auth.server';



export async function action({ request }: ActionFunctionArgs) {
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
		const venueId = formData.get('venueId') as string;
		const organizationId = formData.get('organizationId') as string;

		// Validate required fields
		if (!title || !description || !eventDate || !registrationOpenDate || !registrationCloseDate) {
			return json({ 
				error: 'Missing required fields',
				details: ['Title, description, and all dates are required']
			}, { status: 400 });
		}

		// Convert HTML datetime-local format to ISO 8601 format
		const convertToISO = (dateTimeLocal: string): string => {
			if (!dateTimeLocal) return '';
			
			// Create a Date object from the datetime-local value
			// This will handle the conversion to ISO format properly
			const date = new Date(dateTimeLocal);
			
			// Check if the date is valid
			if (isNaN(date.getTime())) {
				throw new Error(`Invalid date format: ${dateTimeLocal}`);
			}
			
			const isoDate = date.toISOString();
			
			return isoDate;
		};

		// Build the orchestration request
		const orchestrationRequest: CreateEventOrchestrationRequest = {
			title,
			description,
			registrationOpenDate: convertToISO(registrationOpenDate),
			registrationCloseDate: convertToISO(registrationCloseDate),
			eventDate: convertToISO(eventDate),
			organizerId: userId,
		};

		// Handle venue (existing or new)
		if (venueId) {
			orchestrationRequest.venueId = venueId;
		} else {
			const venueName = formData.get('venueName') as string;
			const venueCapacity = parseInt(formData.get('venueCapacity') as string);
			const venueDescription = formData.get('venueDescription') as string;
			
			if (!venueName || !venueCapacity) {
				return json({ 
					error: 'Venue details are required when creating a new venue',
					details: ['Venue name and capacity are required']
				}, { status: 400 });
			}

			orchestrationRequest.venue = {
				createNew: true,
				venueData: {
					name: venueName,
					description: venueDescription,
					capacity: venueCapacity,
					status: 'available'
				}
			};

			// Add venue address
			const street = formData.get('venueStreet') as string;
			const city = formData.get('venueCity') as string;
			const state = formData.get('venueState') as string;
			const country = formData.get('venueCountry') as string;
			const postalCode = formData.get('venuePostalCode') as string;
			const unit = formData.get('venueUnit') as string;

			if (!street || !city || !state || !country || !postalCode) {
				return json({ 
					error: 'Venue address is required when creating a new venue',
					details: ['Street, city, state, country, and postal code are required']
				}, { status: 400 });
			}

			orchestrationRequest.venueAddress = {
				unit: unit || undefined,
				street,
				city,
				state,
				country,
				postalCode
			};
		}

		// Handle organization (existing or new)
		if (organizationId) {
			orchestrationRequest.organizationId = organizationId;
		} else {
			const orgName = formData.get('orgName') as string;
			const orgType = formData.get('orgType') as string;
			const orgDescription = formData.get('orgDescription') as string;

			// Only create organization if both name and type are provided and valid
			if (orgName && orgType && orgType.trim() !== '') {
				const validOrgTypes = ['admin', 'sponsor', 'vendor', 'user'];
				
				if (!validOrgTypes.includes(orgType)) {
					return json({ 
						error: 'Invalid organization type',
						details: [`Organization type must be one of: ${validOrgTypes.join(', ')}. Received: "${orgType}"`]
					}, { status: 400 });
				}

				orchestrationRequest.organization = {
					createNew: true,
					organizationData: {
						name: orgName,
						description: orgDescription,
						type: orgType as 'admin' | 'sponsor' | 'vendor' | 'user',
						status: 'active'
					}
				};
			}
			// If organization fields are not provided, we don't include organization in the request
		}

		// Handle tickets
		const tickets: Array<{
			name: string;
			description?: string;
			price: number;
			purchasePrice: number;
			quantity: number;
			availableQuantity: number;
			promoCode: string;
		}> = [];

		// Parse ticket data from form
		let ticketIndex = 0;
		while (formData.get(`tickets[${ticketIndex}].name`)) {
			const ticketName = formData.get(`tickets[${ticketIndex}].name`) as string;
			const ticketDescription = formData.get(`tickets[${ticketIndex}].description`) as string;
			const ticketPrice = parseFloat(formData.get(`tickets[${ticketIndex}].price`) as string);
			const ticketPurchasePrice = parseFloat(formData.get(`tickets[${ticketIndex}].purchasePrice`) as string);
			const ticketQuantity = parseInt(formData.get(`tickets[${ticketIndex}].quantity`) as string);
			const ticketPromoCode = formData.get(`tickets[${ticketIndex}].promoCode`) as string;

			if (ticketName && !isNaN(ticketPrice) && !isNaN(ticketQuantity) && ticketPromoCode) {
				tickets.push({
					name: ticketName,
					description: ticketDescription,
					price: ticketPrice,
					purchasePrice: ticketPurchasePrice || ticketPrice * 0.9, // Default to 10% discount
					quantity: ticketQuantity,
					availableQuantity: ticketQuantity,
					promoCode: ticketPromoCode
				});
			}
			ticketIndex++;
		}

		if (tickets.length > 0) {
			orchestrationRequest.tickets = tickets;
		}

		// Call the orchestration API
		const response = await fetch('http://localhost:3000/api/events/orchestration/create', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token || ''}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(orchestrationRequest)
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error('API Error Response:', errorData);
			return json({ 
				error: errorData.error || 'Failed to create event',
				details: errorData.details || []
			}, { status: response.status });
		}

		const result: CreateEventOrchestrationResponse = await response.json();
		
		return redirect(`/dashboard/event/${result.event.id}`);

	} catch (error) {
		console.error('Error creating event:', error);
		return json({ 
			error: 'An unexpected error occurred while creating the event',
			details: []
		}, { status: 500 });
	}
}

export default function NewEventPage() {
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === 'submitting';
	
	const [useExistingVenue, setUseExistingVenue] = useState(true);
	const [useExistingOrg, setUseExistingOrg] = useState(true);
	const [ticketCount, setTicketCount] = useState(1);

	const addTicket = () => setTicketCount(prev => prev + 1);
	const removeTicket = () => setTicketCount(prev => Math.max(1, prev - 1));

	return (
		<div className='max-w-4xl mx-auto p-6'>
			<h1 className='text-3xl font-bold text-gray-900 mb-8'>
				Create New Event
			</h1>

			<Form method='post' className='space-y-8'>
				{/* Basic Event Information */}
				<div className='bg-white p-6 rounded-lg shadow'>
					<h2 className='text-xl font-semibold text-gray-900 mb-4'>Event Details</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div>
							<label htmlFor='title' className='block text-sm font-medium text-gray-700 mb-2'>
								Event Title *
							</label>
							<input
								type='text'
								name='title'
								id='title'
								required
								maxLength={512}
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								placeholder='Enter event title'
							/>
						</div>

						<div>
							<label htmlFor='eventDate' className='block text-sm font-medium text-gray-700 mb-2'>
								Event Date & Time *
							</label>
							<input
								type='datetime-local'
								name='eventDate'
								id='eventDate'
								required
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							/>
						</div>

						<div>
							<label htmlFor='registrationOpenDate' className='block text-sm font-medium text-gray-700 mb-2'>
								Registration Opens *
							</label>
							<input
								type='datetime-local'
								name='registrationOpenDate'
								id='registrationOpenDate'
								required
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							/>
						</div>

						<div>
							<label htmlFor='registrationCloseDate' className='block text-sm font-medium text-gray-700 mb-2'>
								Registration Closes *
							</label>
							<input
								type='datetime-local'
								name='registrationCloseDate'
								id='registrationCloseDate'
								required
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							/>
						</div>

						<div className='md:col-span-2'>
							<label htmlFor='description' className='block text-sm font-medium text-gray-700 mb-2'>
								Description *
							</label>
							<textarea
								name='description'
								id='description'
								rows={4}
								required
								maxLength={2048}
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								placeholder='Enter event description'
							/>
						</div>
					</div>
				</div>

				{/* Venue Section */}
				<div className='bg-white p-6 rounded-lg shadow'>
					<h2 className='text-xl font-semibold text-gray-900 mb-4'>Venue</h2>
					
					<div className='mb-4'>
						<label className='flex items-center'>
							<input
								type='radio'
								name='venueType'
								value='existing'
								checked={useExistingVenue}
								onChange={() => setUseExistingVenue(true)}
								className='mr-2'
							/>
							Use Existing Venue
						</label>
						<label className='flex items-center'>
							<input
								type='radio'
								name='venueType'
								value='new'
								checked={!useExistingVenue}
								onChange={() => setUseExistingVenue(false)}
								className='mr-2'
							/>
							Create New Venue
						</label>
					</div>

					{useExistingVenue ? (
						<div>
							<label htmlFor='venueId' className='block text-sm font-medium text-gray-700 mb-2'>
								Select Venue *
							</label>
							<input
								type='text'
								name='venueId'
								id='venueId'
								required
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								placeholder='Enter venue ID (UUID)'
							/>
						</div>
					) : (
						<div className='space-y-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<div>
									<label htmlFor='venueName' className='block text-sm font-medium text-gray-700 mb-2'>
										Venue Name *
									</label>
									<input
										type='text'
										name='venueName'
										id='venueName'
										required
										maxLength={256}
										className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										placeholder='Enter venue name'
									/>
								</div>

								<div>
									<label htmlFor='venueCapacity' className='block text-sm font-medium text-gray-700 mb-2'>
										Capacity *
									</label>
									<input
										type='number'
										name='venueCapacity'
										id='venueCapacity'
										required
										min={1}
										className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										placeholder='Enter capacity'
									/>
								</div>

								<div className='md:col-span-2'>
									<label htmlFor='venueDescription' className='block text-sm font-medium text-gray-700 mb-2'>
										Venue Description
									</label>
									<textarea
										name='venueDescription'
										id='venueDescription'
										rows={3}
										maxLength={1024}
										className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										placeholder='Enter venue description'
									/>
								</div>
							</div>

							{/* Venue Address */}
							<div>
								<h3 className='text-lg font-medium text-gray-900 mb-4'>Venue Address</h3>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<div>
										<label htmlFor='venueUnit' className='block text-sm font-medium text-gray-700 mb-2'>
											Unit
										</label>
										<input
											type='text'
											name='venueUnit'
											id='venueUnit'
											maxLength={16}
											className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='Unit/Floor'
										/>
									</div>

									<div className='md:col-span-2'>
										<label htmlFor='venueStreet' className='block text-sm font-medium text-gray-700 mb-2'>
											Street Address *
										</label>
										<input
											type='text'
											name='venueStreet'
											id='venueStreet'
											required
											maxLength={128}
											className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='Enter street address'
										/>
									</div>

									<div>
										<label htmlFor='venueCity' className='block text-sm font-medium text-gray-700 mb-2'>
											City *
										</label>
										<input
											type='text'
											name='venueCity'
											id='venueCity'
											required
											maxLength={32}
											className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='Enter city'
										/>
									</div>

									<div>
										<label htmlFor='venueState' className='block text-sm font-medium text-gray-700 mb-2'>
											State/Province *
										</label>
										<input
											type='text'
											name='venueState'
											id='venueState'
											required
											maxLength={32}
											className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='Enter state'
										/>
									</div>

									<div>
										<label htmlFor='venueCountry' className='block text-sm font-medium text-gray-700 mb-2'>
											Country *
										</label>
										<input
											type='text'
											name='venueCountry'
											id='venueCountry'
											required
											maxLength={32}
											className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='Enter country'
										/>
									</div>

									<div>
										<label htmlFor='venuePostalCode' className='block text-sm font-medium text-gray-700 mb-2'>
											Postal Code *
										</label>
										<input
											type='text'
											name='venuePostalCode'
											id='venuePostalCode'
											required
											maxLength={32}
											className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='Enter postal code'
										/>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Organization Section */}
				<div className='bg-white p-6 rounded-lg shadow'>
					<h2 className='text-xl font-semibold text-gray-900 mb-4'>Organization (Optional)</h2>
					
					<div className='mb-4'>
						<label className='flex items-center'>
							<input
								type='radio'
								name='orgSelectionType'
								value='existing'
								checked={useExistingOrg}
								onChange={() => setUseExistingOrg(true)}
								className='mr-2'
							/>
							Use Existing Organization
						</label>
						<label className='flex items-center'>
							<input
								type='radio'
								name='orgSelectionType'
								value='new'
								checked={!useExistingOrg}
								onChange={() => setUseExistingOrg(false)}
								className='mr-2'
							/>
							Create New Organization
						</label>
					</div>

					{useExistingOrg ? (
						<div>
							<label htmlFor='organizationId' className='block text-sm font-medium text-gray-700 mb-2'>
								Select Organization
							</label>
							<input
								type='text'
								name='organizationId'
								id='organizationId'
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								placeholder='Enter organization ID (UUID) - optional'
							/>
						</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							<div>
								<label htmlFor='orgName' className='block text-sm font-medium text-gray-700 mb-2'>
									Organization Name
								</label>
								<input
									type='text'
									name='orgName'
									id='orgName'
									maxLength={256}
									className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='Enter organization name'
								/>
							</div>

							<div>
								<label htmlFor='orgType' className='block text-sm font-medium text-gray-700 mb-2'>
									Organization Type *
								</label>
								<select
									name='orgType'
									id='orgType'
									required
									className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								>
									<option value=''>Select type</option>
									<option value='admin'>Admin</option>
									<option value='sponsor'>Sponsor</option>
									<option value='vendor'>Vendor</option>
									<option value='user'>User</option>
								</select>
							</div>

							<div className='md:col-span-2'>
								<label htmlFor='orgDescription' className='block text-sm font-medium text-gray-700 mb-2'>
									Organization Description
								</label>
								<textarea
									name='orgDescription'
									id='orgDescription'
									rows={3}
									maxLength={1024}
									className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='Enter organization description'
								/>
							</div>
						</div>
					)}
				</div>

				{/* Tickets Section */}
				<div className='bg-white p-6 rounded-lg shadow'>
					<div className='flex justify-between items-center mb-4'>
						<h2 className='text-xl font-semibold text-gray-900'>Tickets (Optional)</h2>
						<div className='space-x-2'>
							<button
								type='button'
								onClick={addTicket}
								className='px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600'
							>
								Add Ticket
							</button>
							{ticketCount > 1 && (
								<button
									type='button'
									onClick={removeTicket}
									className='px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600'
								>
									Remove Ticket
								</button>
							)}
						</div>
					</div>

					<div className='space-y-6'>
						{Array.from({ length: ticketCount }, (_, index) => (
							<div key={index} className='border border-gray-200 rounded-lg p-4'>
								<h3 className='text-lg font-medium text-gray-900 mb-4'>Ticket {index + 1}</h3>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<div>
										<label htmlFor={`tickets[${index}].name`} className='block text-sm font-medium text-gray-700 mb-2'>
											Ticket Name *
										</label>
										<input
											type='text'
											name={`tickets[${index}].name`}
											id={`tickets[${index}].name`}
											required
											maxLength={256}
											className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='e.g., General Admission'
										/>
									</div>

									<div>
										<label htmlFor={`tickets[${index}].price`} className='block text-sm font-medium text-gray-700 mb-2'>
											Price ($) *
										</label>
										<input
											type='number'
											name={`tickets[${index}].price`}
											id={`tickets[${index}].price`}
											required
											step='0.01'
											min={0}
											className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='0.00'
										/>
									</div>

									<div>
										<label htmlFor={`tickets[${index}].purchasePrice`} className='block text-sm font-medium text-gray-700 mb-2'>
											Purchase Price ($)
										</label>
										<input
											type='number'
											name={`tickets[${index}].purchasePrice`}
											id={`tickets[${index}].purchasePrice`}
											step='0.01'
											min={0}
											className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='0.00 (defaults to 90% of price)'
										/>
									</div>

									<div>
										<label htmlFor={`tickets[${index}].quantity`} className='block text-sm font-medium text-gray-700 mb-2'>
											Quantity *
										</label>
										<input
											type='number'
											name={`tickets[${index}].quantity`}
											id={`tickets[${index}].quantity`}
											required
											min={1}
											className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='Enter quantity'
										/>
									</div>

									<div>
										<label htmlFor={`tickets[${index}].promoCode`} className='block text-sm font-medium text-gray-700 mb-2'>
											Promo Code *
										</label>
										<input
											type='text'
											name={`tickets[${index}].promoCode`}
											id={`tickets[${index}].promoCode`}
											required
											maxLength={256}
											className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='e.g., EARLYBIRD2024'
										/>
									</div>

									<div className='md:col-span-2'>
										<label htmlFor={`tickets[${index}].description`} className='block text-sm font-medium text-gray-700 mb-2'>
											Description
										</label>
										<textarea
											name={`tickets[${index}].description`}
											id={`tickets[${index}].description`}
											rows={2}
											maxLength={512}
											className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='Enter ticket description'
										/>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Error Display */}
				{actionData?.error && (
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

				{/* Submit Buttons */}
				<div className='flex justify-end space-x-4'>
					<button
						type='button'
						onClick={() => window.history.back()}
						className='px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
					>
						Cancel
					</button>
					<button
						type='submit'
						disabled={isSubmitting}
						className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{isSubmitting ? 'Creating Event...' : 'Create Event'}
					</button>
				</div>
			</Form>
		</div>
	);
}
