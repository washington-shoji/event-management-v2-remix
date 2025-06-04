import { Organization, CreateOrganizationInput, UpdateOrganizationInput } from '~/types/organization';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Helper function to get auth headers
function getAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Create Organization
export async function createOrganization(data: CreateOrganizationInput, token: string): Promise<Organization> {
  const response = await fetch(`${API_BASE_URL}/api/organizations`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data)
  });

  return handleResponse<Organization>(response);
}

// Get All Organizations
export async function getAllOrganizations(token: string): Promise<Organization[]> {
  try {
    console.log(`Fetching organizations from: ${API_BASE_URL}/api/organizations`);
    const response = await fetch(`${API_BASE_URL}/api/organizations`, {
      method: 'GET',
      headers: getAuthHeaders(token)
    });

    return handleResponse<Organization[]>(response);
  } catch (error) {
    console.error(`Failed to fetch organizations from ${API_BASE_URL}/api/organizations:`, error);
    throw new Error(`API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get Organization by ID
export async function getOrganizationById(id: string, token: string): Promise<Organization> {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(token)
  });

  return handleResponse<Organization>(response);
}

// Update Organization
export async function updateOrganization(id: string, data: UpdateOrganizationInput, token: string): Promise<Organization> {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data)
  });

  return handleResponse<Organization>(response);
}

// Delete Organization
export async function deleteOrganization(id: string, token: string): Promise<Organization> {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  });

  return handleResponse<Organization>(response);
}

// Activate Organization
export async function activateOrganization(id: string, token: string): Promise<Organization> {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${id}/activate`, {
    method: 'POST',
    headers: getAuthHeaders(token)
  });

  return handleResponse<Organization>(response);
}

// Deactivate Organization
export async function deactivateOrganization(id: string, token: string): Promise<Organization> {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${id}/deactivate`, {
    method: 'POST',
    headers: getAuthHeaders(token)
  });

  return handleResponse<Organization>(response);
}

// Suspend Organization
export async function suspendOrganization(id: string, token: string): Promise<Organization> {
  const response = await fetch(`${API_BASE_URL}/api/organizations/${id}/suspend`, {
    method: 'POST',
    headers: getAuthHeaders(token)
  });

  return handleResponse<Organization>(response);
} 