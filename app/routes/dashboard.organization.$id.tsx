import { json, ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, Form, Link } from '@remix-run/react';
import { requireAuth } from '~/utils/auth.server';

interface Organization {
	id: string;
	name: string;
	description: string;
	email: string;
	phone: string;
	website: string;
	events: Event[];
}

interface Event {
	id: string;
	title: string;
	date: string;
	venue: string;
	status: string;
}

export async function loader({
	request,
	params,
}: {
	request: Request;
	params: { id: string };
}) {
	await requireAuth(request);

	// TODO: Fetch organization details from API
	const organization: Organization = {
		id: params.id,
		name: 'Sample Organization 1',
		description: 'This is a sample organization description',
		email: 'contact@org1.com',
		phone: '(555) 123-4567',
		website: 'https://org1.com',
		events: [
			{
				id: '1',
				title: 'Sample Event 1',
				date: '2024-04-01',
				venue: 'Sample Venue 1',
				status: 'upcoming',
			},
			{
				id: '2',
				title: 'Sample Event 2',
				date: '2024-04-15',
				venue: 'Sample Venue 2',
				status: 'upcoming',
			},
		],
	};

	return json({ organization });
}

export async function action({ request, params }: ActionFunctionArgs) {
	await requireAuth(request);
	const formData = await request.formData();
	const intent = formData.get('intent');

	if (intent === 'delete') {
		// TODO: Delete organization from API
		return json({ success: true });
	}

	return json({ success: false });
}

export default function OrganizationDetailPage() {
	const { organization } = useLoaderData<typeof loader>();

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-bold text-gray-900'>
					{organization.name}
				</h1>
				<div className='flex space-x-4'>
					<Link
						to={`/organizations/${organization.id}/edit`}
						className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
					>
						Edit Organization
					</Link>
					<Form method='post'>
						<input type='hidden' name='intent' value='delete' />
						<button
							type='submit'
							className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700'
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
							<dt className='text-sm font-medium text-gray-500'>Description</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								{organization.description}
							</dd>
						</div>
						<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Email</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								<a
									href={`mailto:${organization.email}`}
									className='text-indigo-600 hover:text-indigo-900'
								>
									{organization.email}
								</a>
							</dd>
						</div>
						<div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Phone</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								<a
									href={`tel:${organization.phone}`}
									className='text-indigo-600 hover:text-indigo-900'
								>
									{organization.phone}
								</a>
							</dd>
						</div>
						<div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
							<dt className='text-sm font-medium text-gray-500'>Website</dt>
							<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
								<a
									href={organization.website}
									target='_blank'
									rel='noopener noreferrer'
									className='text-indigo-600 hover:text-indigo-900'
								>
									{organization.website}
								</a>
							</dd>
						</div>
					</dl>
				</div>
			</div>

			<div className='bg-white shadow overflow-hidden sm:rounded-lg'>
				<div className='px-4 py-5 sm:px-6'>
					<h3 className='text-lg leading-6 font-medium text-gray-900'>
						Organization Events
					</h3>
				</div>
				<div className='border-t border-gray-200'>
					<ul className='divide-y divide-gray-200'>
						{organization.events.map((event) => (
							<li key={event.id} className='px-4 py-4 sm:px-6'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-sm font-medium text-indigo-600 truncate'>
											{event.title}
										</p>
										<p className='text-sm text-gray-500'>
											{event.date} at {event.venue}
										</p>
									</div>
									<div className='ml-2 flex-shrink-0 flex'>
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												event.status === 'upcoming'
													? 'bg-green-100 text-green-800'
													: 'bg-gray-100 text-gray-800'
											}`}
										>
											{event.status}
										</span>
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}
