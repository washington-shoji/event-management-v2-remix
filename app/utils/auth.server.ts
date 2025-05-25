import { createCookieSessionStorage, redirect } from '@remix-run/node';

const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: 'event_management_session',
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secrets: [process.env.SESSION_SECRET || 'default-secret'],
		secure: process.env.NODE_ENV === 'production',
	},
});

export async function createUserSession(userId: string, token: string) {
	const session = await sessionStorage.getSession();
	session.set('userId', userId);
	session.set('token', token);
	return redirect('/dashboard', {
		headers: {
			'Set-Cookie': await sessionStorage.commitSession(session),
		},
	});
}

export async function getUserSession(request: Request) {
	return sessionStorage.getSession(request.headers.get('Cookie'));
}

export async function getUserId(request: Request) {
	const session = await getUserSession(request);
	const userId = session.get('userId');
	if (!userId || typeof userId !== 'string') return null;
	return userId;
}

export async function getToken(request: Request) {
	const session = await getUserSession(request);
	const token = session.get('token');
	if (!token || typeof token !== 'string') return null;
	return token;
}

export async function requireAuth(request: Request) {
	const userId = await getUserId(request);
	if (!userId) {
		throw redirect('/login');
	}
	return userId;
}

export async function logout(request: Request) {
	const session = await getUserSession(request);
	return redirect('/login', {
		headers: {
			'Set-Cookie': await sessionStorage.destroySession(session),
		},
	});
}

export async function requireAdmin(request: Request) {
	const userId = await requireAuth(request);
	// TODO: Add admin check logic here
	return userId;
}
