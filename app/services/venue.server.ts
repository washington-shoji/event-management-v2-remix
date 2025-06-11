import { getToken } from '~/utils/auth.server';
import type { Venue, CreateVenueInput, UpdateVenueInput } from '~/types/venue';
import { VenueStatus } from '~/types/venue';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Helper function to get auth headers
const getAuthHeaders = async (request: Request) => {
  const token = await getToken(request);
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Helper function to get auth headers without Content-Type for DELETE requests
const getAuthHeadersNoContentType = async (request: Request) => {
  const token = await getToken(request);
  return {
    'Authorization': `Bearer ${token}`
  };
};

export async function getAllVenues(request: Request): Promise<Venue[]> {
  const headers = await getAuthHeaders(request);
  const response = await fetch(`${API_BASE_URL}/api/venues`, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch venues: ${response.statusText}`);
  }

  return response.json();
}

export async function getVenueById(request: Request, id: string): Promise<Venue> {
  const headers = await getAuthHeaders(request);
  const response = await fetch(`${API_BASE_URL}/api/venues/${id}`, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch venue: ${response.statusText}`);
  }

  return response.json();
}

export async function createVenue(request: Request, data: CreateVenueInput): Promise<Venue> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/venues`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create venue: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error creating venue:', error);
    throw error;
  }
}

export async function updateVenue(request: Request, id: string, data: UpdateVenueInput): Promise<Venue> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/venues/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update venue: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error updating venue:', error);
    throw error;
  }
}

export async function deleteVenue(request: Request, id: string): Promise<Venue> {
  try {
    const headers = await getAuthHeadersNoContentType(request);
    const response = await fetch(`${API_BASE_URL}/api/venues/${id}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete venue: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error deleting venue:', error);
    throw error;
  }
}

// Status management functions
export async function markVenueAsAvailable(request: Request, id: string): Promise<Venue> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/venues/${id}/available`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to mark venue as available: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error marking venue as available:', error);
    throw error;
  }
}

export async function markVenueAsUnavailable(request: Request, id: string): Promise<Venue> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/venues/${id}/unavailable`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to mark venue as unavailable: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error marking venue as unavailable:', error);
    throw error;
  }
}

export async function markVenueAsMaintenance(request: Request, id: string): Promise<Venue> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/venues/${id}/maintenance`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to mark venue as maintenance: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error marking venue as maintenance:', error);
    throw error;
  }
}

export async function markVenueAsClosed(request: Request, id: string): Promise<Venue> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/venues/${id}/closed`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to mark venue as closed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error marking venue as closed:', error);
    throw error;
  }
}

export async function updateVenueStatus(request: Request, id: string, status: VenueStatus): Promise<Venue> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/venues/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update venue status: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error updating venue status:', error);
    throw error;
  }
} 