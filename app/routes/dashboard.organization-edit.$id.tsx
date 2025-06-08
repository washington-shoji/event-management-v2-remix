import { json, ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { requireAuth, getToken } from '~/utils/auth.server';
import { getOrganizationById, updateOrganization } from '~/services/organization.server';
import { Organization, UpdateOrganizationInput, UserRole, OrganizationStatus } from '~/types/organization';

interface ActionData {
	error?: string;
	details?: string[];
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	const userId = await requireAuth(request);
	const token = await getToken(request);
	const organizationId = params.id;

	if (!token) {
		throw redirect('/login');
	}

	if (!organizationId) {
		throw redirect('/dashboard/organizations');
	}

	try {
		const organization = await getOrganizationById(organizationId, token);
		return json({ organization });
	} catch (error) {
		console.error('Error fetching organization:', error);
		throw redirect('/dashboard/organizations');
	}
}

export async function action({ request, params }: ActionFunctionArgs) {
	const userId = await requireAuth(request);
	const token = await getToken(request);
	const organizationId = params.id;

	if (!token) {
		throw redirect('/login');
	}

	if (!organizationId) {
		return json<ActionData>({ 
			error: 'Organization ID is required',
			details: ['Missing organization ID']
		}, { status: 400 });
	}

	const formData = await request.formData();
	const name = formData.get('name') as string;
	const description = formData.get('description') as string;
	const type = formData.get('type') as UserRole;
	const status = formData.get('status') as OrganizationStatus;

	if (!name || typeof name !== 'string') {
		return json<ActionData>({ 
			error: 'Name is required',
			details: ['Organization name is required']
		}, { status: 400 });
	}

	if (name.length < 2) {
		return json<ActionData>({ 
			error: 'Name must be at least 2 characters',
			details: ['Organization name must be at least 2 characters long']
		}, { status: 400 });
	}

	if (name.length > 255) {
		return json<ActionData>({ 
			error: 'Name must be less than 255 characters',
			details: ['Organization name must be less than 255 characters']
		}, { status: 400 });
	}

	if (description && description.length > 1024) {
		return json<ActionData>({ 
			error: 'Description must be less than 1024 characters',
			details: ['Organization description must be less than 1024 characters']
		}, { status: 400 });
	}

	if (!type || !['admin', 'sponsor', 'vendor', 'user'].includes(type)) {
		return json<ActionData>({ 
			error: 'Valid organization type is required',
			details: ['Organization type must be one of: admin, sponsor, vendor, user']
		}, { status: 400 });
	}

	try {
		const updateData: UpdateOrganizationInput = {
			name: name.trim(),
			description: description?.trim() || undefined,
			type,
			status: status || 'pending',
			addressId: null
		};

		await updateOrganization(organizationId, updateData, token);
		return redirect('/dashboard/organizations');
	} catch (error) {
		console.error('Error updating organization:', error);
		return json<ActionData>(
			{ 
				error: 'Failed to update organization. Please try again.',
				details: ['An unexpected error occurred while updating the organization']
			},
			{ status: 500 }
		);
	}
}

export default function EditOrganizationPage() {
	const { organization } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === 'submitting';

	return (
		<div className='max-w-4xl mx-auto p-6'>
			<div className='mb-6'>
				<h1 className='text-3xl font-bold text-gray-900'>Edit Organization</h1>
				<p className='mt-1 text-sm text-gray-500'>
					Update organization details and settings.
				</p>
			</div>

			<Form method='post' className='space-y-8'>
				{/* Basic Organization Information */}
				<div className='bg-white p-6 rounded-lg shadow'>
					<h2 className='text-xl font-semibold text-gray-900 mb-4'>Organization Details</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div>
							<label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-2'>
								Organization Name *
							</label>
							<input
								type='text'
								name='name'
								id='name'
								required
								minLength={2}
								maxLength={255}
								defaultValue={organization.name}
								placeholder='Enter organization name'
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							/>
						</div>

						<div>
							<label htmlFor='type' className='block text-sm font-medium text-gray-700 mb-2'>
								Organization Type *
							</label>
							<select
								name='type'
								id='type'
								required
								defaultValue={organization.type}
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							>
								<option value=''>Select organization type</option>
								<option value='admin'>Admin</option>
								<option value='sponsor'>Sponsor</option>
								<option value='vendor'>Vendor</option>
								<option value='user'>User</option>
							</select>
						</div>

						<div>
							<label htmlFor='status' className='block text-sm font-medium text-gray-700 mb-2'>
								Status
							</label>
							<select
								name='status'
								id='status'
								defaultValue={organization.status}
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							>
								<option value='pending'>Pending</option>
								<option value='active'>Active</option>
								<option value='inactive'>Inactive</option>
								<option value='suspended'>Suspended</option>
							</select>
						</div>

						<div className='md:col-span-2'>
							<label htmlFor='description' className='block text-sm font-medium text-gray-700 mb-2'>
								Description
							</label>
							<textarea
								name='description'
								id='description'
								rows={4}
								maxLength={1024}
								defaultValue={organization.description || ''}
								placeholder='Enter organization description (optional)'
								className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							/>
						</div>
					</div>
				</div>

				{/* Organization Information Display */}
				<div className='bg-white p-6 rounded-lg shadow'>
					<h2 className='text-xl font-semibold text-gray-900 mb-4'>Organization Information</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Organization ID
							</label>
							<div className='px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600'>
								{organization.id}
							</div>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Created Date
							</label>
							<div className='px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600'>
								{new Date(organization.createdAt).toLocaleDateString()}
							</div>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Last Updated
							</label>
							<div className='px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600'>
								{new Date(organization.updatedAt).toLocaleDateString()}
							</div>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Address ID
							</label>
							<div className='px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600'>
								{organization.addressId || 'Not assigned'}
							</div>
						</div>
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
						{isSubmitting ? 'Updating Organization...' : 'Update Organization'}
					</button>
				</div>
			</Form>
		</div>
	);
} 