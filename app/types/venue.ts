export enum VenueStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  MAINTENANCE = 'maintenance',
  CLOSED = 'closed',
}

export interface Venue {
  id: string;
  name: string;
  description: string;
  capacity: number;
  status: VenueStatus;
  addressId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVenueInput {
  name: string;
  description: string;
  capacity: number;
  status: VenueStatus;
  addressId?: string | null;
}

export interface UpdateVenueInput {
  name?: string;
  description?: string;
  capacity?: number;
  status?: VenueStatus;
  addressId?: string | null;
} 