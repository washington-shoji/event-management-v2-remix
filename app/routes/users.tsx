import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node';
import {
	Form,
	useActionData,
	useLoaderData,
	useNavigation,
} from '@remix-run/react';
import { deleteUser, listUsers, updateUser } from '~/services/user.server';
import { getToken, requireAdmin } from '~/utils/auth.server';
import type { UpdateUserInput } from '~/types/user';

interface ActionData {
	error?: string;
	success?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAdmin(request);
	const token = await getToken(request);
	if (!token) throw new Error('No token found');

	const users = await listUsers(token);
	return json({ users });
}

export async function action({ request }: ActionFunctionArgs) {
	const token = await getToken(request);
	if (!token) throw new Error('No token found');

	const formData = await request.formData();
	const intent = formData.get('intent');
	const userId = formData.get('userId');

	if (!userId || typeof userId !== 'string') {
		return json<ActionData>({ error: 'User ID is required' }, { status: 400 });
	}

	try {
		if (intent === 'delete') {
			await deleteUser(userId, token);
			return json<ActionData>({ success: 'User deleted successfully' });
		}

		if (intent === 'update') {
			const role = formData.get('role');
			const input: UpdateUserInput = {};

			if (role && typeof role === 'string') {
				input.role = role as 'admin' | 'sponsor' | 'vendor' | 'user';
			}

			await updateUser(userId, input, token);
			return json<ActionData>({ success: 'User updated successfully' });
		}

		return json<ActionData>({ error: 'Invalid action' }, { status: 400 });
	} catch (error) {
		return json<ActionData>(
			{
				error:
					error instanceof Error ? error.message : 'Failed to perform action',
			},
			{ status: 500 }
		);
	}
}

export default function UsersPage() {
	const { users } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === 'submitting';

	return (
		<div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-7xl mx-auto'>
				<div className='bg-white shadow overflow-hidden sm:rounded-lg border border-black'>
					<div className='px-4 py-5 sm:px-6'>
						<h3 className='text-lg leading-6 font-medium text-black'>Users</h3>
					</div>
					<div className='border-t border-black'>
						<ul className='divide-y divide-black'>
							{users.map((user) => (
								<li key={user.id} className='px-4 py-4 sm:px-6'>
									<div className='flex items-center justify-between'>
										<div className='flex-1 min-w-0'>
											<p className='text-sm font-medium text-black truncate'>
												{user.firstName} {user.lastName}
											</p>
											<p className='text-sm text-black'>{user.email}</p>
										</div>
										<div className='flex items-center space-x-4'>
											<Form method='post'>
												<input type='hidden' name='userId' value={user.id} />
												<input type='hidden' name='intent' value='update' />
												<select
													name='role'
													defaultValue={user.role}
													className='mt-1 block w-full border text-white border-black rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm'
												>
													<option value='user'>User</option>
													<option value='admin'>Admin</option>
													<option value='sponsor'>Sponsor</option>
													<option value='vendor'>Vendor</option>
												</select>
												<button
													type='submit'
													disabled={isSubmitting}
													className='mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-black hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black'
												>
													Update Role
												</button>
											</Form>
											<Form method='post'>
												<input type='hidden' name='userId' value={user.id} />
												<input type='hidden' name='intent' value='delete' />
												<button
													type='submit'
													disabled={isSubmitting}
													className='inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-black hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black'
												>
													Delete
												</button>
											</Form>
										</div>
									</div>
								</li>
							))}
						</ul>
					</div>
				</div>

				{actionData?.error && (
					<div className='mt-4 text-black text-sm'>{actionData.error}</div>
				)}
				{actionData?.success && (
					<div className='mt-4 text-black text-sm'>{actionData.success}</div>
				)}
			</div>
		</div>
	);
}
