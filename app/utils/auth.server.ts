import { redirect } from '@remix-run/node';
import { requireUserId } from '~/services/auth.server';

export async function requireAuth(request: Request) {
	const userId = await requireUserId(request);
	if (!userId) {
		throw redirect('/login');
	}
	return userId;
}

export async function requireAdmin(request: Request) {
	const userId = await requireUserId(request);
	if (!userId) {
		throw redirect('/login');
	}
	// TODO: Add admin check logic here
	return userId;
}
