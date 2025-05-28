import { API_URL } from '~/config';
import type {
	User,
	CreateUserInput,
	LoginInput,
	LoginResponse,
	ValidationError,
	NotFoundError,
	InternalServerError,
	InvalidCredentialsError,
	UpdateUserInput,
} from '~/types/user';

const getAuthHeaders = (token?: string) => {
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
	};
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}
	return headers;
};

export async function createUser(input: CreateUserInput): Promise<User> {

	// Ensure password is a string and trim any whitespace
	const password = String(input.password).trim();
	if (!password) {
		throw new Error('Password cannot be empty');
	}

	const requestBody = {
		email: String(input.email).trim(),
		password,
		firstName: String(input.firstName).trim(),
		lastName: String(input.lastName).trim(),
		phone: input.phone ? String(input.phone).trim() : undefined,
		role: input.role || 'user',
		organizationId: input.organizationId,
		addressId: input.addressId,
	};

	try {
		const response = await fetch(`${API_URL}/api/users`, {
			method: 'POST',
			headers: getAuthHeaders(),
			body: JSON.stringify(requestBody),
		});

		const responseData = await response.json();

		if (!response.ok) {
			if (response.status === 400) {
				const error: ValidationError = responseData;
				throw new Error(error.message);
			}
			if (response.status === 500) {
				const error: InternalServerError = responseData;
				throw new Error(error.message || 'Failed to create user');
			}
			throw new Error('Failed to create user');
		}

		return responseData;
	} catch (error) {
		console.error('Error in createUser:', error);
		throw error;
	}
}

export async function getUser(id: string, token: string): Promise<User> {
	const response = await fetch(`${API_URL}/api/users/${id}`, {
		headers: getAuthHeaders(token),
	});

	if (!response.ok) {
		if (response.status === 404) {
			const error: NotFoundError = await response.json();
			throw new Error(error.message || 'User not found');
		}
		if (response.status === 500) {
			const error: InternalServerError = await response.json();
			throw new Error(error.message || 'Failed to get user');
		}
		throw new Error('Failed to get user');
	}

	return response.json();
}

export async function login(input: LoginInput): Promise<LoginResponse> {
	const response = await fetch(`${API_URL}/api/auth/login`, {
		method: 'POST',
		headers: getAuthHeaders(),
		body: JSON.stringify(input),
	});

	if (!response.ok) {
		if (response.status === 400) {
			const error: ValidationError = await response.json();
			throw new Error(error.message);
		}
		if (response.status === 401) {
			const error: InvalidCredentialsError = await response.json();
			throw new Error(error.message);
		}
		if (response.status === 500) {
			const error: InternalServerError = await response.json();
			throw new Error(error.message || 'Failed to login');
		}
		throw new Error('Failed to login');
	}

	return response.json();
}

export async function updateUser(
	id: string,
	input: UpdateUserInput,
	token: string
): Promise<User> {
	const response = await fetch(`${API_URL}/api/users/${id}`, {
		method: 'PUT',
		headers: getAuthHeaders(token),
		body: JSON.stringify(input),
	});

	if (!response.ok) {
		if (response.status === 400) {
			const error: ValidationError = await response.json();
			throw new Error(error.message);
		}
		if (response.status === 404) {
			const error: NotFoundError = await response.json();
			throw new Error(error.message || 'User not found');
		}
		if (response.status === 500) {
			const error: InternalServerError = await response.json();
			throw new Error(error.message || 'Failed to update user');
		}
		throw new Error('Failed to update user');
	}

	return response.json();
}

export async function deleteUser(id: string, token: string): Promise<void> {
	const response = await fetch(`${API_URL}/api/users/${id}`, {
		method: 'DELETE',
		headers: getAuthHeaders(token),
	});

	if (!response.ok) {
		if (response.status === 404) {
			const error: NotFoundError = await response.json();
			throw new Error(error.message || 'User not found');
		}
		if (response.status === 500) {
			const error: InternalServerError = await response.json();
			throw new Error(error.message || 'Failed to delete user');
		}
		throw new Error('Failed to delete user');
	}
}

export async function listUsers(token: string): Promise<User[]> {
	const response = await fetch(`${API_URL}/api/users`, {
		headers: getAuthHeaders(token),
	});

	if (!response.ok) {
		if (response.status === 500) {
			const error: InternalServerError = await response.json();
			throw new Error(error.message || 'Failed to list users');
		}
		throw new Error('Failed to list users');
	}

	return response.json();
}
