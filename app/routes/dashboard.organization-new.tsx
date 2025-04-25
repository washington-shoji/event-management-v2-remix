import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { requireAuth } from '~/utils/auth.server';
import { UserRole, OrganizationStatus } from '~/types/organization';

export async function action({ request }: ActionFunctionArgs) {
	await requireAuth(request);
	const formData = await request.formData();
	const name = formData.get('name');
	const description = formData.get('description');
	const type = formData.get('type');
	const status = formData.get('status');
	const street = formData.get('street');
	const city = formData.get('city');
	const state = formData.get('state');
	const zipCode = formData.get('zipCode');
	const country = formData.get('country');

	if (!name || typeof name !== 'string') {
		return Response.json({ error: 'Name is required' }, { status: 400 });
	}

	if (!description || typeof description !== 'string') {
		return Response.json({ error: 'Description is required' }, { status: 400 });
	}

	if (
		!type ||
		typeof type !== 'string' ||
		!Object.values(UserRole).includes(type as UserRole)
	) {
		return Response.json({ error: 'Valid type is required' }, { status: 400 });
	}

	if (
		!status ||
		typeof status !== 'string' ||
		!Object.values(OrganizationStatus).includes(status as OrganizationStatus)
	) {
		return Response.json(
			{ error: 'Valid status is required' },
			{ status: 400 }
		);
	}

	if (!street) {
		return Response.json({ error: 'Street is required' }, { status: 400 });
	}

	if (!city) {
		return Response.json({ error: 'City is required' }, { status: 400 });
	}

	if (!state) {
		return Response.json({ error: 'State is required' }, { status: 400 });
	}

	if (!zipCode) {
		return Response.json({ error: 'ZIP code is required' }, { status: 400 });
	}

	if (!country) {
		return Response.json({ error: 'Country is required' }, { status: 400 });
	}

	try {
		// TODO: Create organization in API
		return redirect('/organizations');
	} catch (error) {
		return Response.json(
			{ error: 'Failed to create organization' },
			{ status: 500 }
		);
	}
}

export default function NewOrganizationPage() {
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === 'submitting';

	return (
		<div className='max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8'>
			<div className='md:flex md:items-center md:justify-between'>
				<div className='flex-1 min-w-0'>
					<h2 className='text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate'>
						Create New Organization
					</h2>
				</div>
			</div>

			<Form method='post' className='mt-8 space-y-6'>
				<div>
					<label htmlFor='name' className='sr-only'>
						Name
					</label>
					<input
						id='name'
						name='name'
						type='text'
						required
						placeholder='Organization Name'
						className='appearance-none relative block w-full px-3 py-2 border border-black placeholder-white text-white rounded focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-md'
					/>
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
						placeholder='Organization Description'
						className='appearance-none relative block w-full px-3 py-2 border border-black placeholder-white text-white rounded focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-md'
					/>
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div>
						<label htmlFor='type' className='sr-only'>
							Type
						</label>
						<select
							id='type'
							name='type'
							required
							className='appearance-none relative block w-full px-3 py-2 border border-black placeholder-white text-white rounded focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-md'
						>
							<option value=''>Select Type</option>
							{Object.values(UserRole).map((role) => (
								<option key={role} value={role}>
									{role.charAt(0).toUpperCase() + role.slice(1)}
								</option>
							))}
						</select>
					</div>

					<div>
						<label htmlFor='status' className='sr-only'>
							Status
						</label>
						<select
							id='status'
							name='status'
							required
							className='appearance-none relative block w-full px-3 py-2 border border-black placeholder-white text-white rounded focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-md'
						>
							<option value=''>Select Status</option>
							{Object.values(OrganizationStatus).map((orgStatus) => (
								<option key={orgStatus} value={orgStatus}>
									{orgStatus.charAt(0).toUpperCase() + orgStatus.slice(1)}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div>
						<label htmlFor='street' className='sr-only'>
							Street
						</label>
						<input
							id='street'
							name='street'
							type='text'
							placeholder='Street Address'
							className='appearance-none relative block w-full px-3 py-2 border border-black placeholder-white text-white rounded focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-md'
						/>
					</div>
					<div>
						<label htmlFor='city' className='sr-only'>
							City
						</label>
						<input
							id='city'
							name='city'
							type='text'
							placeholder='City'
							className='appearance-none relative block w-full px-3 py-2 border border-black placeholder-white text-white rounded focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-md'
						/>
					</div>
				</div>

				<div className='grid grid-cols-3 gap-4'>
					<div>
						<label htmlFor='state' className='sr-only'>
							State
						</label>
						<input
							id='state'
							name='state'
							type='text'
							placeholder='State'
							className='appearance-none relative block w-full px-3 py-2 border border-black placeholder-white text-white rounded focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-md'
						/>
					</div>
					<div>
						<label htmlFor='zipCode' className='sr-only'>
							ZIP Code
						</label>
						<input
							id='zipCode'
							name='zipCode'
							type='text'
							placeholder='ZIP Code'
							className='appearance-none relative block w-full px-3 py-2 border border-black placeholder-white text-white rounded focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-md'
						/>
					</div>
					<div>
						<label htmlFor='country' className='sr-only'>
							Country
						</label>
						<input
							id='country'
							name='country'
							type='text'
							placeholder='Country'
							className='appearance-none relative block w-full px-3 py-2 border border-black placeholder-white text-white rounded focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-md'
						/>
					</div>
				</div>

				{actionData?.error && (
					<div className='text-red-500 text-sm'>{actionData.error}</div>
				)}

				<div className='flex justify-end space-x-4'>
					<button
						type='button'
						onClick={() => window.history.back()}
						className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
					>
						Cancel
					</button>
					<button
						type='submit'
						disabled={isSubmitting}
						className='group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black'
					>
						{isSubmitting ? 'Creating...' : 'Create Organization'}
					</button>
				</div>
			</Form>
		</div>
	);
}
