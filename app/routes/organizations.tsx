import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { requireAuth } from '~/utils/auth.server';

interface Organization {
	id: string;
	name: string;
	description: string;
	email: string;
	phone: string;
	website: string;
}

export async function loader({ request }: { request: Request }) {
	await requireAuth(request);

	// TODO: Fetch organizations from API
	const organizations: Organization[] = [
		{
			id: '1',
			name: 'Sample Organization 1',
			description: 'This is a sample organization description',
			email: 'contact@org1.com',
			phone: '(555) 123-4567',
			website: 'https://org1.com',
		},
		{
			id: '2',
			name: 'Sample Organization 2',
			description: 'This is another sample organization description',
			email: 'contact@org2.com',
			phone: '(555) 987-6543',
			website: 'https://org2.com',
		},
	];

	return json({ organizations });
}

export default function OrganizationsPage() {
	const { organizations } = useLoaderData<typeof loader>();

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-bold text-gray-900'>Organizations</h1>
				<Link
					to='/organizations/new'
					className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'
				>
					Create Organization
				</Link>
			</div>

			<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
				{organizations.map((organization) => (
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
									<span className='font-medium'>Email:</span>{' '}
									<a
										href={`mailto:${organization.email}`}
										className='text-indigo-600 hover:text-indigo-900'
									>
										{organization.email}
									</a>
								</p>
								<p className='text-sm text-gray-500'>
									<span className='font-medium'>Phone:</span>{' '}
									<a
										href={`tel:${organization.phone}`}
										className='text-indigo-600 hover:text-indigo-900'
									>
										{organization.phone}
									</a>
								</p>
								<p className='text-sm text-gray-500'>
									<span className='font-medium'>Website:</span>{' '}
									<a
										href={organization.website}
										target='_blank'
										rel='noopener noreferrer'
										className='text-indigo-600 hover:text-indigo-900'
									>
										{organization.website}
									</a>
								</p>
							</div>
							<div className='mt-4'>
								<Link
									to={`/organizations/${organization.id}`}
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
