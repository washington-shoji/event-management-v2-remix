export enum UserRole {
	ADMIN = 'admin',
	SPONSOR = 'sponsor',
	VENDOR = 'vendor',
	USER = 'user',
}

export enum OrganizationStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	SUSPENDED = 'suspended',
	PENDING = 'pending',
}

export interface Organization {
	id: string;
	name: string;
	description?: string;
	type: UserRole;
	status: OrganizationStatus;
	addressId?: string | null;
	createdAt: Date;
	updatedAt: Date;
}
