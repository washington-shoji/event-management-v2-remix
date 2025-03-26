import { createCookieSessionStorage } from '@remix-run/node';
import {
	LoginCredentials,
	RegisterCredentials,
	AuthResponse,
} from '~/types/auth';

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

export async function login(
	credentials: LoginCredentials
): Promise<AuthResponse> {
	const response = await fetch(`${process.env.API_URL}/auth/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(credentials),
	});

	if (!response.ok) {
		throw new Error('Login failed');
	}

	return response.json();
}

export async function register(
	credentials: RegisterCredentials
): Promise<AuthResponse> {
	const response = await fetch(`${process.env.API_URL}/users`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(credentials),
	});

	if (!response.ok) {
		throw new Error('Registration failed');
	}

	return response.json();
}

export async function createUserSession(userId: string, token: string) {
	const session = await sessionStorage.getSession();
	session.set('userId', userId);
	session.set('token', token);
	return sessionStorage.commitSession(session);
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

export async function requireUserId(request: Request) {
	const userId = await getUserId(request);
	if (!userId) throw new Error('User not authenticated');
	return userId;
}

export async function logout(request: Request) {
	const session = await getUserSession(request);
	return sessionStorage.destroySession(session);
}
