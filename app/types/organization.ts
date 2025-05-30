export type UserRole = 'admin' | 'sponsor' | 'vendor' | 'user';
export type OrganizationStatus = 'active' | 'inactive' | 'suspended' | 'pending';

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

export interface CreateOrganizationInput {
	name: string;
	description?: string;
	type: UserRole;
	status?: OrganizationStatus;
	addressId?: string | null;
}

export interface UpdateOrganizationInput {
	name?: string;
	description?: string;
	type?: UserRole;
	status?: OrganizationStatus;
	addressId?: string | null;
}
