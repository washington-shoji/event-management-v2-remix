import { json, ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { requireAuth } from '~/utils/auth.server';

interface ActionData {
	error?: string;
}

export async function action({ request }: ActionFunctionArgs) {
	await requireAuth(request);
	const formData = await request.formData();
	const name = formData.get('name');
	const description = formData.get('description');
	const email = formData.get('email');
	const phone = formData.get('phone');
	const website = formData.get('website');

	if (!name || typeof name !== 'string') {
		return json<ActionData>({ error: 'Name is required' }, { status: 400 });
	}

	if (!description || typeof description !== 'string') {
		return json<ActionData>(
			{ error: 'Description is required' },
			{ status: 400 }
		);
	}

	if (!email || typeof email !== 'string') {
		return json<ActionData>({ error: 'Email is required' }, { status: 400 });
	}

	if (!phone || typeof phone !== 'string') {
		return json<ActionData>({ error: 'Phone is required' }, { status: 400 });
	}

	if (!website || typeof website !== 'string') {
		return json<ActionData>({ error: 'Website is required' }, { status: 400 });
	}

	try {
		// TODO: Create organization in API
		return redirect('/organizations');
	} catch (error) {
		return json<ActionData>(
			{ error: 'Failed to create organization' },
			{ status: 500 }
		);
	}
}

export default function NewOrganizationPage() {
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === 'submitting';

	return (
		<div className='max-w-2xl mx-auto'>
			<h1 className='text-2xl font-bold text-gray-900 mb-6'>
				Create New Organization
			</h1>

			<Form method='post' className='space-y-6'>
				<div>
					<label
						htmlFor='name'
						className='block text-sm font-medium text-gray-700'
					>
						Name
					</label>
					<input
						type='text'
						name='name'
						id='name'
						required
						className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
					/>
				</div>

				<div>
					<label
						htmlFor='description'
						className='block text-sm font-medium text-gray-700'
					>
						Description
					</label>
					<textarea
						name='description'
						id='description'
						rows={4}
						required
						className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
					/>
				</div>

				<div>
					<label
						htmlFor='email'
						className='block text-sm font-medium text-gray-700'
					>
						Email
					</label>
					<input
						type='email'
						name='email'
						id='email'
						required
						className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
					/>
				</div>

				<div>
					<label
						htmlFor='phone'
						className='block text-sm font-medium text-gray-700'
					>
						Phone
					</label>
					<input
						type='tel'
						name='phone'
						id='phone'
						required
						className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
					/>
				</div>

				<div>
					<label
						htmlFor='website'
						className='block text-sm font-medium text-gray-700'
					>
						Website
					</label>
					<input
						type='url'
						name='website'
						id='website'
						required
						className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
					/>
				</div>

				{actionData?.error && (
					<div className='text-red-500 text-sm'>{actionData.error}</div>
				)}

				<div className='flex justify-end space-x-4'>
					<button
						type='button'
						onClick={() => window.history.back()}
						className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
					>
						Cancel
					</button>
					<button
						type='submit'
						disabled={isSubmitting}
						className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
					>
						{isSubmitting ? 'Creating...' : 'Create Organization'}
					</button>
				</div>
			</Form>
		</div>
	);
}
