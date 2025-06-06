import { json, ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, Form, Link } from '@remix-run/react';
import { requireAuth, getToken } from '~/utils/auth.server';
import { getOrganizationById, deleteOrganization } from '~/services/organization.server';

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
		return json({ error: 'Organization ID is required' }, { status: 400 });
	}

	const formData = await request.formData();
	const intent = formData.get('intent');

	if (intent === 'delete') {
		try {
			await deleteOrganization(organizationId, token);
			return redirect('/dashboard/organizations');
		} catch (error) {
			console.error('Error deleting organization:', error);
			return json({ error: 'Failed to delete organization' }, { status: 500 });
		}
	}

	return json({ error: 'Invalid action' }, { status: 400 });
}

function getStatusBadgeColor(status: string): string {
	switch (status) {
		case 'active':
			return 'bg-green-100 text-green-800';
		case 'inactive':
			return 'bg-gray-100 text-gray-800';
		case 'suspended':
			return 'bg-red-100 text-red-800';
		case 'pending':
			return 'bg-yellow-100 text-yellow-800';
		default:
			return 'bg-gray-100 text-gray-800';
	}
}

function getTypeBadgeColor(type: string): string {
	switch (type) {
		case 'admin':
			return 'bg-purple-100 text-purple-800';
		case 'sponsor':
			return 'bg-blue-100 text-blue-800';
		case 'vendor':
			return 'bg-indigo-100 text-indigo-800';
		case 'user':
			return 'bg-gray-100 text-gray-800';
		default:
			return 'bg-gray-100 text-gray-800';
	}
}

export default function OrganizationDetailPage() {
	const { organization } = useLoaderData<typeof loader>();

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-2xl font-bold text-gray-900'>
						{organization.name}
					</h1>
					<div className='mt-2 flex space-x-2'>
						<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(organization.status)}`}>
							{organization.status}
						</span>
						<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(organization.type)}`}>
							{organization.type}
						</span>
					</div>
				</div>
				<div className='flex space-x-4'>
					<Link
						to={`/dashboard/organization-edit/${organization.id}`}
						className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
					>
						Edit Organization
					</Link>
					<Form method='post'>
						<input type='hidden' name='intent' value='delete' />
						<button
							type='submit'
							className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
						>
							Delete Organization
						</button>
					</Form>
				</div>
			</div>

			<div className='bg-white shadow overflow-hidden sm:rounded-lg'>
				<div className='px-4 py-5 sm:px-6'>
					<h3 className='text-lg leading-6 font-medium text-gray-900'>
						Organization Information
					</h3>
				</div>
				<div className='border-t border-gray-200'>
					<dl>
						<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Organization ID</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono'>
								{organization.id}
							</dd>
						</div>
						<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Description</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{organization.description || 'No description provided'}
							</dd>
						</div>
						<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Type</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(organization.type)}`}>
									{organization.type}
								</span>
							</dd>
						</div>
						<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Status</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(organization.status)}`}>
									{organization.status}
								</span>
							</dd>
						</div>
						<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Created Date</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{new Date(organization.createdAt).toLocaleDateString()}
							</dd>
						</div>
						<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Last Updated</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{new Date(organization.updatedAt).toLocaleDateString()}
							</dd>
						</div>
						<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Address ID</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{organization.addressId || 'Not assigned'}
							</dd>
						</div>
					</dl>
				</div>
			</div>

			{/* Placeholder for future events section */}
			<div className='bg-white shadow overflow-hidden sm:rounded-lg'>
				<div className='px-4 py-5 sm:px-6'>
					<h3 className='text-lg leading-6 font-medium text-gray-900'>
						Organization Events
					</h3>
					<p className='mt-1 text-sm text-gray-500'>
						Events associated with this organization will appear here.
					</p>
				</div>
				<div className='border-t border-gray-200'>
					<div className='px-4 py-8 text-center'>
						<svg className='mx-auto h-12 w-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
						</svg>
						<h3 className='mt-2 text-sm font-medium text-gray-900'>No events</h3>
						<p className='mt-1 text-sm text-gray-500'>
							This organization doesn't have any events yet.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
