import { useLoaderData, Link } from '@remix-run/react';
import {
	Organization,
	OrganizationStatus,
	UserRole,
} from '~/types/organization';
import { requireAuth } from '~/utils/auth.server';

export async function loader({ request }: { request: Request }) {
	await requireAuth(request);

	// TODO: Fetch organizations from API
	const organizations: Organization[] = [
		{
			id: '1',
			name: 'Sample Organization 1',
			description: 'This is a sample organization description',
			type: UserRole.ADMIN,
			status: OrganizationStatus.ACTIVE,
			createdAt: new Date('2021-01-01'),
			updatedAt: new Date('2021-01-01'),
		},
		{
			id: '2',
			name: 'Sample Organization 2',
			description: 'This is another sample organization description',
			type: UserRole.ADMIN,
			status: OrganizationStatus.ACTIVE,
			createdAt: new Date('2021-01-01'),
			updatedAt: new Date('2021-01-01'),
		},
	];

	return Response.json({ organizations });
}

export default function OrganizationsPage() {
	const { organizations } = useLoaderData<typeof loader>();

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-bold text-gray-900'>Organizations</h1>
				<Link
					to='/dashboard/organization-new'
					className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-black'
				>
					Create Organization
				</Link>
			</div>

			<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
				{organizations.map((organization: Organization) => (
					<div
						key={organization.id}
						className='bg-white overflow-hidden shadow rounded-lg'
					>
						<div className='px-4 py-5 sm:p-6'>
							<h3 className='text-lg font-medium text-gray-900'>
								{organization.name}
							</h3>
							<p className='mt-2 text-sm text-gray-500'>
								{organization.description}
							</p>
							<div className='mt-4'>
								<p className='text-sm text-gray-500'>
									<span className='font-medium'>Type:</span> {organization.type}
								</p>
								<p className='text-sm text-gray-500'>
									<span className='font-medium'>Status:</span>{' '}
									{organization.status}
								</p>
							</div>
							<div className='mt-4'>
								<Link
									to={`/dashboard/organization/${organization.id}`}
									className='text-indigo-600 hover:text-indigo-900'
								>
									View Details →
								</Link>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
