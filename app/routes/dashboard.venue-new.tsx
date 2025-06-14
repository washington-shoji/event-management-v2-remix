import { json, ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { requireAuth } from '~/utils/auth.server';
import { createVenue } from '~/services/venue.server';
import type { CreateVenueInput } from '~/types/venue';
import { VenueStatus } from '~/types/venue';

interface ActionData {
	error?: string;
	details?: string[];
}

export async function action({ request }: ActionFunctionArgs) {
	await requireAuth(request);

	const formData = await request.formData();
	
	try {
		// Parse form data
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const capacity = parseInt(formData.get('capacity') as string);
		const status = formData.get('status') as VenueStatus;
		const addressId = formData.get('addressId') as string;

		// Validate required fields
		if (!name || !description || !capacity || !status) {
			return json<ActionData>({ 
				error: 'Missing required fields',
				details: ['Name, description, capacity, and status are required']
			}, { status: 400 });
		}

		// Validate capacity
		if (isNaN(capacity) || capacity <= 0) {
			return json<ActionData>({ 
				error: 'Invalid capacity',
				details: ['Capacity must be a positive number']
			}, { status: 400 });
		}

		// Validate status
		const validStatuses = Object.values(VenueStatus);
		if (!validStatuses.includes(status)) {
			return json<ActionData>({ 
				error: 'Invalid status',
				details: [`Status must be one of: ${validStatuses.join(', ')}`]
			}, { status: 400 });
		}

		// Validate name length
		if (name.length < 1 || name.length > 255) {
			return json<ActionData>({ 
				error: 'Invalid name length',
				details: ['Name must be between 1 and 255 characters']
			}, { status: 400 });
		}

		// Validate description length
		if (description.length < 1 || description.length > 1024) {
			return json<ActionData>({ 
				error: 'Invalid description length',
				details: ['Description must be between 1 and 1024 characters']
			}, { status: 400 });
		}

		// Build the venue data
		const venueData: CreateVenueInput = {
			name: name.trim(),
			description: description.trim(),
			capacity,
			status,
			addressId: addressId || null
		};

		// Create the venue
		const venue = await createVenue(request, venueData);
		
		return redirect(`/dashboard/venue/${venue.id}`);

	} catch (error) {
		console.error('Error creating venue:', error);
		return json<ActionData>({ 
			error: 'An unexpected error occurred while creating the venue',
			details: []
		}, { status: 500 });
	}
}

export default function NewVenuePage() {
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === 'submitting';

	return (
		<div className='max-w-4xl mx-auto p-6'>
			<h1 className='text-3xl font-bold text-gray-900 mb-8'>
				Create New Venue
			</h1>

			<Form method='post' className='space-y-8'>
				{/* Basic Venue Information */}
				<div className='bg-white p-6 rounded-lg shadow'>
					<h2 className='text-xl font-semibold text-gray-900 mb-4'>Venue Details</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div>
							<label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-2'>
								Venue Name *
							</label>
							<input
								type='text'
								name='name'
								id='name'
								required
								maxLength={255}
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								placeholder='Enter venue name'
							/>
						</div>

						<div>
							<label htmlFor='capacity' className='block text-sm font-medium text-gray-700 mb-2'>
								Capacity *
							</label>
							<input
								type='number'
								name='capacity'
								id='capacity'
								required
								min={1}
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								placeholder='Enter capacity'
							/>
						</div>

						<div>
							<label htmlFor='status' className='block text-sm font-medium text-gray-700 mb-2'>
								Status *
							</label>
							<select
								name='status'
								id='status'
								required
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							>
								<option value=''>Select status</option>
								<option value={VenueStatus.AVAILABLE}>Available</option>
								<option value={VenueStatus.UNAVAILABLE}>Unavailable</option>
								<option value={VenueStatus.MAINTENANCE}>Maintenance</option>
								<option value={VenueStatus.CLOSED}>Closed</option>
							</select>
						</div>

						<div>
							<label htmlFor='addressId' className='block text-sm font-medium text-gray-700 mb-2'>
								Address ID (Optional)
							</label>
							<input
								type='text'
								name='addressId'
								id='addressId'
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								placeholder='Enter address ID (UUID)'
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
								maxLength={1024}
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								placeholder='Enter venue description'
							/>
						</div>
					</div>
				</div>

				{/* Error Display */}
				{actionData?.error && (
					<div className='bg-red-50 border border-red-200 rounded-md p-4'>
						<div className='flex'>
							<div className='flex-shrink-0'>
								<svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
									<path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
								</svg>
							</div>
							<div className='ml-3'>
								<h3 className='text-sm font-medium text-red-800'>
									Error creating venue
								</h3>
								<div className='mt-2 text-sm text-red-700'>
									<p>{actionData.error}</p>
									{actionData.details && actionData.details.length > 0 && (
										<ul className='mt-2 list-disc list-inside'>
											{actionData.details.map((detail, index) => (
												<li key={index}>{detail}</li>
											))}
										</ul>
									)}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Submit Button */}
				<div className='flex justify-end space-x-4'>
					<button
						type='button'
						onClick={() => window.history.back()}
						className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
					>
						Cancel
					</button>
					<button
						type='submit'
						disabled={isSubmitting}
						className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{isSubmitting ? 'Creating...' : 'Create Venue'}
					</button>
				</div>
			</Form>
		</div>
	);
}
