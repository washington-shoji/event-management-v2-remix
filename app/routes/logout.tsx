import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { logout } from '~/services/auth.server';

export async function action({ request }: ActionFunctionArgs) {
	const destroyedSession = await logout(request);
	return redirect('/login', {
		headers: {
			'Set-Cookie': destroyedSession,
		},
	});
}
