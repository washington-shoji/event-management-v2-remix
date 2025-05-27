import { ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { createUser } from '~/services/user.server';
import { createUserSession } from '~/utils/auth.server';
import type { CreateUserInput } from '~/types/user';

interface ActionData {
	error?: string;
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const email = formData.get('email');
	const password = formData.get('password');
	const firstName = formData.get('firstName');
	const lastName = formData.get('lastName');

	if (!email || typeof email !== 'string') {
		return json<ActionData>({ error: 'Email is required' }, { status: 400 });
	}

	if (!password || typeof password !== 'string') {
		return json<ActionData>({ error: 'Password is required' }, { status: 400 });
	}

	if (!firstName || typeof firstName !== 'string') {
		return json<ActionData>(
			{ error: 'First name is required' },
			{ status: 400 }
		);
	}

	if (!lastName || typeof lastName !== 'string') {
		return json<ActionData>(
			{ error: 'Last name is required' },
			{ status: 400 }
		);
	}

	try {
		const input: CreateUserInput = {
			email,
			password: String(password),
			firstName,
			lastName,
			role: 'user',
		};

		const user = await createUser(input);
		// Redirect to login page after successful registration
		return redirect('/login');
	} catch (error) {
		return json<ActionData>(
			{
				error:
					error instanceof Error ? error.message : 'Failed to register account',
			},
			{ status: 500 }
		);
	}
}

export default function RegisterPage() {
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === 'submitting';

	return (
		<section className="bg-gray-50 dark:bg-gray-900">
			<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
				<div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
					<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
						<h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
							Register your account
						</h1>
						<Form className="space-y-4 md:space-y-6" method="post">
							<div>
								<label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">First Name</label>
								<input type="text" name="firstName" id="firstName" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Your first name" required/>
							</div>
							<div>
								<label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last Name</label>
								<input type="text" name="lastName" id="lastName" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Your last name" required/>
							</div>
							<div>
								<label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
								<input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required/>
							</div>
							<div>
								<label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
								<input type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required/>
							</div>

							{typeof actionData === 'object' && actionData?.error && (
								<div className='text-black text-sm'>{actionData.error}</div>
							)}

							<button disabled={isSubmitting} type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
								{isSubmitting ? 'Registering account...' : 'Register'}
							</button>
							<p className="text-sm font-light text-gray-500 dark:text-gray-400">
								Already have an account? <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Login</Link>
							</p>
						</Form>
					</div>
				</div>
			</div>
		</section>
	);
}
