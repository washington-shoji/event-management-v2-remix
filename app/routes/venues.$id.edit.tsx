import { json, ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { requireAuth } from '~/utils/auth.server';

interface Venue {
	id: string;
	name: string;
	description: string;
	address: string;
	capacity: number;
	amenities: string[];
}

interface ActionData {
	errors?: {
		name?: string;
		description?: string;
		address?: string;
		capacity?: string;
		amenities?: string;
	};
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

	return json({ venue });
}

export async function action({ request, params }: ActionFunctionArgs) {
	await requireAuth(request);

	const formData = await request.formData();
	const name = formData.get('name');
	const description = formData.get('description');
	const address = formData.get('address');
	const capacity = formData.get('capacity');
	const amenities = formData.get('amenities');

	const errors: ActionData['errors'] = {};

	if (!name) {
		errors.name = 'Name is required';
	}

	if (!description) {
		errors.description = 'Description is required';
	}

	if (!address) {
		errors.address = 'Address is required';
	}

	if (!capacity) {
		errors.capacity = 'Capacity is required';
	} else if (isNaN(Number(capacity))) {
		errors.capacity = 'Capacity must be a number';
	}

	if (!amenities) {
		errors.amenities = 'Amenities are required';
	}

	if (Object.keys(errors).length > 0) {
		return json<ActionData>({ errors }, { status: 400 });
	}

	try {
		// TODO: Update venue via API
		return redirect(`/venues/${params.id}`);
	} catch (error) {
		return json<ActionData>(
			{ errors: { name: 'Failed to update venue' } },
			{ status: 500 }
		);
	}
}

export default function EditVenuePage() {
	const { venue } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();

	return (
		<div className='max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8'>
			<div className='md:flex md:items-center md:justify-between'>
				<div className='flex-1 min-w-0'>
					<h2 className='text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate'>
						Edit Venue
					</h2>
				</div>
			</div>

			<Form method='post' className='mt-8 space-y-6'>
				<div className='rounded-md shadow-sm -space-y-px'>
					<div>
						<label htmlFor='name' className='sr-only'>
							Name
						</label>
						<input
							id='name'
							name='name'
							type='text'
							required
							defaultValue={venue.name}
							className='appearance-none rounded-none relative block w-full px-3 py-2 border border-black placeholder-white text-white rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm'
							placeholder='Venue Name'
						/>
						{actionData?.errors?.name && (
							<p className='mt-1 text-sm text-black'>
								{actionData.errors.name}
							</p>
						)}
					</div>
					<div>
						<label htmlFor='description' className='sr-only'>
							Description
						</label>
						<textarea
							id='description'
							name='description'
							required
							rows={3}
							defaultValue={venue.description}
							className='appearance-none rounded-none relative block w-full px-3 py-2 border border-black placeholder-white text-white focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm'
							placeholder='Venue Description'
						/>
						{actionData?.errors?.description && (
							<p className='mt-1 text-sm text-black'>
								{actionData.errors.description}
							</p>
						)}
					</div>
					<div>
						<label htmlFor='address' className='sr-only'>
							Address
						</label>
						<input
							id='address'
							name='address'
							type='text'
							required
							defaultValue={venue.address}
							className='appearance-none rounded-none relative block w-full px-3 py-2 border border-black placeholder-white text-white focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm'
							placeholder='Venue Address'
						/>
						{actionData?.errors?.address && (
							<p className='mt-1 text-sm text-black'>
								{actionData.errors.address}
							</p>
						)}
					</div>
					<div>
						<label htmlFor='capacity' className='sr-only'>
							Capacity
						</label>
						<input
							id='capacity'
							name='capacity'
							type='number'
							required
							defaultValue={venue.capacity}
							className='appearance-none rounded-none relative block w-full px-3 py-2 border border-black placeholder-white text-white focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm'
							placeholder='Venue Capacity'
						/>
						{actionData?.errors?.capacity && (
							<p className='mt-1 text-sm text-black'>
								{actionData.errors.capacity}
							</p>
						)}
					</div>
					<div>
						<label htmlFor='amenities' className='sr-only'>
							Amenities
						</label>
						<input
							id='amenities'
							name='amenities'
							type='text'
							required
							defaultValue={venue.amenities.join(', ')}
							className='appearance-none rounded-none relative block w-full px-3 py-2 border border-black placeholder-white text-white rounded-b-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm'
							placeholder='Amenities (comma-separated)'
						/>
						{actionData?.errors?.amenities && (
							<p className='mt-1 text-sm text-black'>
								{actionData.errors.amenities}
							</p>
						)}
					</div>
				</div>

				<div>
					<button
						type='submit'
						className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black'
					>
						Update Venue
					</button>
				</div>
			</Form>
		</div>
	);
}
