import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node';
import {
	Form,
	useActionData,
	useLoaderData,
	useNavigation,
} from '@remix-run/react';
import { getUser, updateUser } from '~/services/user.server';
import { getToken, requireAuth } from '~/utils/auth.server';
import type { UpdateUserInput } from '~/types/user';

interface ActionData {
	error?: string;
	success?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireAuth(request);
	const token = await getToken(request);
	if (!token) throw new Error('No token found');

	const user = await getUser(userId, token);
	return json({ user });
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireAuth(request);
	const token = await getToken(request);
	if (!token) throw new Error('No token found');

	const formData = await request.formData();
	const firstName = formData.get('firstName');
	const lastName = formData.get('lastName');
	const phone = formData.get('phone');
	const email = formData.get('email');
	const newPassword = formData.get('newPassword');

	const input: UpdateUserInput = {};

	if (firstName && typeof firstName === 'string') input.firstName = firstName;
	if (lastName && typeof lastName === 'string') input.lastName = lastName;
	if (phone && typeof phone === 'string') input.phone = phone;
	if (email && typeof email === 'string') input.email = email;
	if (newPassword && typeof newPassword === 'string')
		input.password = newPassword;

	try {
		await updateUser(userId, input, token);
		return json<ActionData>({ success: 'Profile updated successfully' });
	} catch (error) {
		return json<ActionData>(
			{
				error:
					error instanceof Error ? error.message : 'Failed to update profile',
			},
			{ status: 500 }
		);
	}
}

export default function ProfilePage() {
	const { user } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === 'submitting';

	return (
		<div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-3xl mx-auto'>
				<div className='bg-white shadow overflow-hidden sm:rounded-lg border border-black'>
					<div className='px-4 py-5 sm:px-6'>
						<h3 className='text-lg leading-6 font-medium text-white'>
							Profile Information
						</h3>
					</div>
					<div className='border-t border-black px-4 py-5 sm:px-6'>
						<Form method='post' className='space-y-6'>
							<div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
								<div>
									<label
										htmlFor='firstName'
										className='block text-sm font-medium text-white'
									>
										First Name
									</label>
									<input
										type='text'
										name='firstName'
										id='firstName'
										defaultValue={user.firstName}
										className='mt-1 block w-full border border-black rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm text-white'
									/>
								</div>
								<div>
									<label
										htmlFor='lastName'
										className='block text-sm font-medium text-white'
									>
										Last Name
									</label>
									<input
										type='text'
										name='lastName'
										id='lastName'
										defaultValue={user.lastName}
										className='mt-1 block w-full border border-black rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm text-white'
									/>
								</div>
								<div>
									<label
										htmlFor='email'
										className='block text-sm font-medium text-white'
									>
										Email
									</label>
									<input
										type='email'
										name='email'
										id='email'
										defaultValue={user.email}
										className='mt-1 block w-full border border-black rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm text-white'
									/>
								</div>
								<div>
									<label
										htmlFor='phone'
										className='block text-sm font-medium text-white'
									>
										Phone
									</label>
									<input
										type='tel'
										name='phone'
										id='phone'
										defaultValue={user.phone || ''}
										className='mt-1 block w-full border border-black rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm text-white'
									/>
								</div>
							</div>

							<div className='border-t border-black pt-6'>
								<h4 className='text-lg font-medium text-white mb-4'>
									Change Password
								</h4>
								<div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
									<div>
										<label
											htmlFor='currentPassword'
											className='block text-sm font-medium text-white'
										>
											Current Password
										</label>
										<input
											type='password'
											name='currentPassword'
											id='currentPassword'
											className='mt-1 block w-full border border-black rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm text-white'
										/>
									</div>
									<div>
										<label
											htmlFor='newPassword'
											className='block text-sm font-medium text-white'
										>
											New Password
										</label>
										<input
											type='password'
											name='newPassword'
											id='newPassword'
											className='mt-1 block w-full border border-black rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm text-white'
										/>
									</div>
								</div>
							</div>

							{actionData?.error && (
								<div className='text-white text-sm'>{actionData.error}</div>
							)}
							{actionData?.success && (
								<div className='text-white text-sm'>{actionData.success}</div>
							)}

							<div className='flex justify-end'>
								<button
									type='submit'
									disabled={isSubmitting}
									className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black'
								>
									{isSubmitting ? 'Saving...' : 'Save Changes'}
								</button>
							</div>
						</Form>
					</div>
				</div>
			</div>
		</div>
	);
}
