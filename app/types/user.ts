export type UserRole = 'admin' | 'sponsor' | 'vendor' | 'user';

export interface User {
	id: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phone?: string | null;
	role: UserRole;
	organizationId?: string | null;
	addressId?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface UserResponse {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	phone?: string | null;
	role: UserRole;
	organizationId?: string;
	addressId?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateUserInput {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phone?: string;
	role: UserRole;
	organizationId?: string;
	addressId?: string | null;
}

export interface UpdateUserInput {
	email?: string;
	password?: string;
	firstName?: string;
	lastName?: string;
	phone?: string;
	role?: UserRole;
	organizationId?: string | null;
	addressId?: string | null;
}

export interface LoginInput {
	email: string;
	password: string;
}

export interface LoginResponse {
	token: string;
	user: UserResponse;
}

export interface ValidationError {
	error: string;
	message: string;
	details: {
		message: string;
		path?: string;
		code?: string;
	}[];
}

export interface NotFoundError {
	error: string;
	message?: string;
}

export interface InternalServerError {
	error: string;
	message?: string;
}

export interface InvalidCredentialsError {
	error: string;
	message: string;
}
