import { json, ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { requireAuth } from '~/utils/auth.server';

interface ActionData {
	error?: string;
}

export async function action({ request }: ActionFunctionArgs) {
	await requireAuth(request);
	const formData = await request.formData();
	const title = formData.get('title');
	const description = formData.get('description');
	const date = formData.get('date');
	const venue = formData.get('venue');
	const organization = formData.get('organization');

	if (!title || typeof title !== 'string') {
		return json<ActionData>({ error: 'Title is required' }, { status: 400 });
	}

	if (!description || typeof description !== 'string') {
		return json<ActionData>(
			{ error: 'Description is required' },
			{ status: 400 }
		);
	}

	if (!date || typeof date !== 'string') {
		return json<ActionData>({ error: 'Date is required' }, { status: 400 });
	}

	if (!venue || typeof venue !== 'string') {
		return json<ActionData>({ error: 'Venue is required' }, { status: 400 });
	}

	if (!organization || typeof organization !== 'string') {
		return json<ActionData>(
			{ error: 'Organization is required' },
			{ status: 400 }
		);
	}

	try {
		// TODO: Create event in API
		return redirect('/events');
	} catch (error) {
		return json<ActionData>(
			{ error: 'Failed to create event' },
			{ status: 500 }
		);
	}
}

export default function NewEventPage() {
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === 'submitting';

	return (
		<div className='max-w-2xl mx-auto'>
			<h1 className='text-2xl font-bold text-gray-900 mb-6'>
				Create New Event
			</h1>

			<Form method='post' className='space-y-6'>
				<div>
					<label
						htmlFor='title'
						className='block text-sm font-medium text-gray-700'
					>
						Title
					</label>
					<input
						type='text'
						name='title'
						id='title'
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
						htmlFor='date'
						className='block text-sm font-medium text-gray-700'
					>
						Date
					</label>
					<input
						type='datetime-local'
						name='date'
						id='date'
						required
						className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
					/>
				</div>

				<div>
					<label
						htmlFor='venue'
						className='block text-sm font-medium text-gray-700'
					>
						Venue
					</label>
					<input
						type='text'
						name='venue'
						id='venue'
						required
						className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
					/>
				</div>

				<div>
					<label
						htmlFor='organization'
						className='block text-sm font-medium text-gray-700'
					>
						Organization
					</label>
					<input
						type='text'
						name='organization'
						id='organization'
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
						{isSubmitting ? 'Creating...' : 'Create Event'}
					</button>
				</div>
			</Form>
		</div>
	);
}
