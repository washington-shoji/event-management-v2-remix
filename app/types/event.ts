// Basic event type for API responses
export interface ApiEvent {
	id: string;
	title: string;
	description: string;
	date: string;
	venue: string;
	organization: string;
	status: string;
	tickets?: Array<{
		id: string;
		name: string;
		description: string;
		price: string;
		purchasePrice: string;
		quantity: number;
		availableQuantity: number;
		promoCode: string;
		createdAt: string;
		updatedAt: string;
	}>;
	attendeeCount?: number;
}

// Types for the orchestration API
export interface CreateEventOrchestrationRequest {
	title: string;
	description: string;
	registrationOpenDate: string;
	registrationCloseDate: string;
	eventDate: string;
	organizerId: string;
	venueId?: string;
	organizationId?: string;
	venue?: {
		createNew: boolean;
		venueData?: {
			name: string;
			description?: string;
			capacity: number;
			status: 'available' | 'unavailable' | 'maintenance' | 'closed';
		};
	};
	venueAddress?: {
		unit?: string;
		street: string;
		city: string;
		state: string;
		country: string;
		postalCode: string;
	};
	tickets?: Array<{
		name: string;
		description?: string;
		price: number;
		purchasePrice: number;
		quantity: number;
		availableQuantity: number;
		promoCode: string;
	}>;
	organization?: {
		createNew: boolean;
		organizationData?: {
			name: string;
			description?: string;
			type: 'admin' | 'sponsor' | 'vendor' | 'user';
			status?: 'active' | 'inactive' | 'suspended' | 'pending';
		};
	};
}

export interface CreateEventOrchestrationResponse {
	event: {
		id: string;
		title: string;
		description: string;
		registrationOpenDate: string;
		registrationCloseDate: string;
		eventDate: string;
		venueId: string;
		organizerId: string;
		organizationId: string | null;
		status: string;
		createdAt: string;
		updatedAt: string;
	};
	venue?: {
		id: string;
		name: string;
		description: string;
		capacity: number;
		addressId: string | null;
		status: string;
		createdAt: string;
		updatedAt: string;
	};
	address?: {
		id: string;
		unit: string | null;
		street: string;
		city: string;
		state: string;
		country: string;
		postalCode: string;
		createdAt: string;
		updatedAt: string;
	};
	organization?: {
		id: string;
		name: string;
		description: string;
		type: string;
		status: string;
		addressId: string | null;
		createdAt: string;
		updatedAt: string;
	};
	tickets?: Array<{
		id: string;
		name: string;
		description: string;
		price: string;
		purchasePrice: string;
		quantity: number;
		availableQuantity: number;
		promoCode: string;
		createdAt: string;
		updatedAt: string;
	}>;
	message: string;
}

// Types for the orchestration API
export interface UpdateEventOrchestrationRequest {
	title?: string;
	description?: string;
	registrationOpenDate?: string;
	registrationCloseDate?: string;
	eventDate?: string;
	venueId?: string;
	organizerId?: string;
	organizationId?: string;
	status?: string;
	venue?: {
		update: boolean;
		venueData?: {
			name?: string;
			description?: string;
			capacity?: number;
			status?: string;
		};
	};
	tickets?: {
		create?: Array<{
			name: string;
			description?: string;
			price: number;
			purchasePrice: number;
			quantity: number;
			availableQuantity: number;
			promoCode: string;
		}>;
		update?: Array<{
			id: string;
			data: {
				name?: string;
				description?: string;
				price?: number;
				purchasePrice?: number;
				quantity?: number;
				availableQuantity?: number;
				promoCode?: string;
			};
		}>;
		delete?: string[];
	};
}

export interface EventDetailsResponse {
	event: {
		id: string;
		title: string;
		description: string;
		registrationOpenDate: string;
		registrationCloseDate: string;
		eventDate: string;
		venueId: string;
		organizerId: string;
		organizationId: string | null;
		status: string;
		createdAt: string;
		updatedAt: string;
	};
	venue?: {
		id: string;
		name: string;
		description: string;
		capacity: number;
		addressId: string | null;
		status: string;
		createdAt: string;
		updatedAt: string;
	};
	address?: {
		id: string;
		unit: string | null;
		street: string;
		city: string;
		state: string;
		country: string;
		postalCode: string;
		createdAt: string;
		updatedAt: string;
	};
	organization?: {
		id: string;
		name: string;
		description: string;
		type: string;
		status: string;
		addressId: string | null;
		createdAt: string;
		updatedAt: string;
	};
	tickets?: Array<{
		id: string;
		name: string;
		description: string;
		price: string;
		purchasePrice: string;
		quantity: number;
		availableQuantity: number;
		promoCode: string;
		createdAt: string;
		updatedAt: string;
	}>;
	attendeeCount?: number;
}