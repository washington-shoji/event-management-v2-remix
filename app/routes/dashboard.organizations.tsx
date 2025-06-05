import { useLoaderData, Link, Form, useActionData, useNavigation } from '@remix-run/react';
import { json, type ActionFunctionArgs, redirect } from '@remix-run/node';
import { Organization, OrganizationStatus } from '~/types/organization';
import { requireAuth, getToken } from '~/utils/auth.server';
import { getAllOrganizations, activateOrganization, deactivateOrganization, suspendOrganization, deleteOrganization } from '~/services/organization.server';

export async function loader({ request }: { request: Request }) {
	const userId = await requireAuth(request);
	const token = await getToken(request);

	if (!token) {
		throw redirect('/login');
	}

	try {
		const organizations = await getAllOrganizations(token);
		return json({ organizations, error: null });
	} catch (error) {
		console.error('Error fetching organizations:', error);
		return json({ organizations: [], error: 'Failed to fetch organizations' });
	}
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireAuth(request);
	const token = await getToken(request);
	const formData = await request.formData();
	const action = formData.get('action') as string;
	const organizationId = formData.get('organizationId') as string;

	if (!token) {
		throw redirect('/login');
	}

	if (!organizationId) {
		return json({ error: 'Organization ID is required' }, { status: 400 });
	}

	try {
		let result: Organization;

		switch (action) {
			case 'activate':
				result = await activateOrganization(organizationId, token);
				break;
			case 'deactivate':
				result = await deactivateOrganization(organizationId, token);
				break;
			case 'suspend':
				result = await suspendOrganization(organizationId, token);
				break;
			case 'delete':
				result = await deleteOrganization(organizationId, token);
				break;
			default:
				return json({ error: 'Invalid action' }, { status: 400 });
		}

		return json({ success: true, organization: result });
	} catch (error) {
		console.error('Error performing organization action:', error);
		return json({ error: 'Failed to perform action' }, { status: 500 });
	}
}

function getStatusBadgeColor(status: OrganizationStatus): string {
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

export default function OrganizationsPage() {
	const { organizations, error } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === 'submitting';

	if (error) {
		return (
			<div className="space-y-6">
				<div className="bg-red-50 border border-red-200 rounded-md p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
							</svg>
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-red-800">Error</h3>
							<div className="mt-2 text-sm text-red-700">{error}</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
					<p className="mt-1 text-sm text-gray-500">
						Manage your organizations and their status
					</p>
				</div>
				<Link
					to="/dashboard/organization-new"
					className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
					</svg>
					Create Organization
				</Link>
			</div>

			{actionData && 'error' in actionData && actionData.error && (
				<div className="bg-red-50 border border-red-200 rounded-md p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
							</svg>
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-red-800">Error</h3>
							<div className="mt-2 text-sm text-red-700">{actionData.error}</div>
						</div>
					</div>
				</div>
			)}

			<div className="bg-white shadow overflow-hidden sm:rounded-md">
				<ul className="divide-y divide-gray-200">
					{organizations.filter(org => org !== null).map((organization) => (
						<li key={organization.id}>
							<div className="px-4 py-4 sm:px-6">
								<div className="flex flex-col sm:flex-row items-center justify-between">
									<div className="flex items-center w-full sm:w-3/4">
										<div className="flex-shrink-0">
											<div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
												<span className="text-indigo-600 font-medium text-sm">
													{organization?.name?.charAt(0).toUpperCase() || 'O'}
												</span>
											</div>
										</div>
										<div className="ml-4">
											<div className="flex items-center">
												<h3 className="text-lg font-medium text-gray-900">
													{organization?.name || 'Unnamed Organization'}
												</h3>
												<div className="ml-2 flex space-x-2">
													<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(organization?.status || 'pending')}`}>
														{organization?.status || 'pending'}
													</span>
													<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(organization?.type || 'user')}`}>
														{organization?.type || 'user'}
													</span>
												</div>
											</div>
											{organization?.description && (
												<p className="mt-1 text-sm text-gray-500">
													{organization.description}
												</p>
											)}
											<div className="mt-2 flex items-center text-sm text-gray-500">
												<svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
												</svg>
												Created {organization?.createdAt ? new Date(organization.createdAt).toLocaleDateString() : 'Unknown'}
											</div>
										</div>
									</div>
									<div className="flex items-center space-x-2">
										<Link
											to={`/dashboard/organization/${organization?.id || ''}`}
											className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
										>
											View Details
										</Link>
										<div className="relative">
											<Form method="post" className="inline">
												<input type="hidden" name="organizationId" value={organization?.id || ''} />
												{organization?.status === 'pending' && (
													<button
														type="submit"
														name="action"
														value="activate"
														disabled={isSubmitting}
														className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
													>
														Activate
													</button>
												)}
												{organization?.status === 'active' && (
													<>
														<button
															type="submit"
															name="action"
															value="deactivate"
															disabled={isSubmitting}
															className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 mr-1"
														>
															Deactivate
														</button>
														<button
															type="submit"
															name="action"
															value="suspend"
															disabled={isSubmitting}
															className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
														>
															Suspend
														</button>
													</>
												)}
												{organization?.status === 'inactive' && (
													<button
														type="submit"
														name="action"
														value="activate"
														disabled={isSubmitting}
														className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
													>
														Activate
													</button>
												)}
												{organization?.status === 'suspended' && (
													<button
														type="submit"
														name="action"
														value="activate"
														disabled={isSubmitting}
														className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
													>
														Activate
													</button>
												)}
											</Form>
										</div>
									</div>
								</div>
							</div>
						</li>
					))}
				</ul>
			</div>

			{organizations.length === 0 && (
				<div className="text-center py-12">
					<svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
					</svg>
					<h3 className="mt-2 text-sm font-medium text-gray-900">No organizations</h3>
					<p className="mt-1 text-sm text-gray-500">
						Get started by creating a new organization.
					</p>
					<div className="mt-6">
						<Link
							to="/dashboard/organization-new"
							className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
							Create Organization
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}
