export interface Venue {
	name: string;
	description: string;
	capacity: number;
	status: VenueStatus;
	addressId: string | null;
}

export enum VenueStatus {
	AVAILABLE = 'available',
	UNAVAILABLE = 'unavailable',
	MAINTENANCE = 'maintenance',
	CLOSED = 'closed',
}
