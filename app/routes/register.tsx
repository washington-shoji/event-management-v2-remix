import { ActionFunctionArgs, json } from '@remix-run/node';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { register, createUserSession } from '~/services/auth.server';
import { RegisterCredentials } from '~/types/auth';

interface ActionData {
	error?: string;
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const email = formData.get('email');
	const password = formData.get('password');
	const confirmPassword = formData.get('confirmPassword');
	const name = formData.get('name');

	if (!email || typeof email !== 'string') {
		return json<ActionData>({ error: 'Email is required' }, { status: 400 });
	}

	if (!password || typeof password !== 'string') {
		return json<ActionData>({ error: 'Password is required' }, { status: 400 });
	}

	if (!confirmPassword || typeof confirmPassword !== 'string') {
		return json<ActionData>(
			{ error: 'Confirm password is required' },
			{ status: 400 }
		);
	}

	if (!name || typeof name !== 'string') {
		return json<ActionData>({ error: 'Name is required' }, { status: 400 });
	}

	if (password !== confirmPassword) {
		return json<ActionData>(
			{ error: 'Passwords do not match' },
			{ status: 400 }
		);
	}

	try {
		const credentials: RegisterCredentials = {
			email,
			password,
			name,
			confirmPassword,
		};
		const { user, token } = await register(credentials);
		return createUserSession(user.id, token);
	} catch (error) {
		return json<ActionData>({ error: 'Registration failed' }, { status: 400 });
	}
}

export default function RegisterPage() {
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === 'submitting';

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				<div>
					<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
						Create your account
					</h2>
				</div>
				<Form method='post' className='mt-8 space-y-6'>
					<div className='rounded-md shadow-sm -space-y-px'>
						<div>
							<label htmlFor='name' className='sr-only'>
								Full Name
							</label>
							<input
								id='name'
								name='name'
								type='text'
								required
								className='appearance-none rounded-none relative block w-full px-3 py-2 border border-black placeholder-white text-white rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm'
								placeholder='Full Name'
							/>
						</div>
						<div>
							<label htmlFor='email' className='sr-only'>
								Email address
							</label>
							<input
								id='email'
								name='email'
								type='email'
								required
								className='appearance-none rounded-none relative block w-full px-3 py-2 border border-black placeholder-white text-white focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm'
								placeholder='Email address'
							/>
						</div>
						<div>
							<label htmlFor='password' className='sr-only'>
								Password
							</label>
							<input
								id='password'
								name='password'
								type='password'
								required
								className='appearance-none rounded-none relative block w-full px-3 py-2 border border-black placeholder-white text-white focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm'
								placeholder='Password'
							/>
						</div>
						<div>
							<label htmlFor='confirmPassword' className='sr-only'>
								Confirm Password
							</label>
							<input
								id='confirmPassword'
								name='confirmPassword'
								type='password'
								required
								className='appearance-none rounded-none relative block w-full px-3 py-2 border border-black placeholder-white text-white rounded-b-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm'
								placeholder='Confirm Password'
							/>
						</div>
					</div>

					{typeof actionData === 'object' && actionData?.error && (
						<div className='text-black text-sm'>{actionData.error}</div>
					)}

					<div>
						<button
							type='submit'
							disabled={isSubmitting}
							className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black'
						>
							{isSubmitting ? 'Creating account...' : 'Create account'}
						</button>
					</div>
				</Form>
			</div>
		</div>
	);
}
