import { getToken } from '~/utils/auth.server';
import type { ApiEvent, EventDetailsResponse } from '~/types/event';

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

export async function getEventsForRegistration(request: Request, userId: string): Promise<ApiEvent[]> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/events/not-by-user/${userId}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events for registration: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform API response to match our ApiEvent interface
    const events: ApiEvent[] = (Array.isArray(data) ? data : data.events || []).map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.eventDate || event.date,
      venue: event.venue?.name || event.venue || 'Unknown Venue',
      organization: event.organization?.name || event.organization || 'Unknown Organization',
      status: event.status || 'upcoming'
    }));

    return events;
  } catch (error) {
    console.error('Error fetching events for registration:', error);
    throw error;
  }
}

export async function getEventsByUser(request: Request, userId: string): Promise<ApiEvent[]> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/events/by-user/${userId}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform API response to match our ApiEvent interface
    const events: ApiEvent[] = (Array.isArray(data) ? data : data.events || []).map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.eventDate || event.date,
      venue: event.venue?.name || event.venue || 'Unknown Venue',
      organization: event.organization?.name || event.organization || 'Unknown Organization',
      status: event.status || 'upcoming'
    }));

    return events;
  } catch (error) {
    console.error('Error fetching events by user:', error);
    throw error;
  }
}

export async function getAllEvents(request: Request): Promise<ApiEvent[]> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform API response to match our ApiEvent interface
    const events: ApiEvent[] = (Array.isArray(data) ? data : data.events || []).map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.eventDate || event.date,
      venue: event.venue?.name || event.venue || 'Unknown Venue',
      organization: event.organization?.name || event.organization || 'Unknown Organization',
      status: event.status || 'upcoming'
    }));

    return events;
  } catch (error) {
    console.error('Error fetching all events:', error);
    throw error;
  }
}

export async function getEventById(request: Request, id: string): Promise<ApiEvent> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/events/orchestration/${id}/details`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch event: ${response.statusText}`);
    }

    const result: EventDetailsResponse = await response.json();
    const { event, venue, organization, tickets, attendeeCount } = result;

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.eventDate,
      venue: venue?.name || 'Unknown Venue',
      organization: organization?.name || 'Unknown Organization',
      status: event.status,
      tickets: tickets || [],
      attendeeCount: attendeeCount || 0
    };
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    throw error;
  }
}

export async function createEvent(request: Request, eventData: any): Promise<ApiEvent> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify(eventData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create event: ${response.statusText}`);
    }

    const event = await response.json();

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.eventDate || event.date,
      venue: event.venue?.name || event.venue || 'Unknown Venue',
      organization: event.organization?.name || event.organization || 'Unknown Organization',
      status: event.status || 'upcoming'
    };
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

export async function updateEvent(request: Request, id: string, eventData: any): Promise<ApiEvent> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(eventData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update event: ${response.statusText}`);
    }

    const event = await response.json();

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.eventDate || event.date,
      venue: event.venue?.name || event.venue || 'Unknown Venue',
      organization: event.organization?.name || event.organization || 'Unknown Organization',
      status: event.status || 'upcoming'
    };
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

export async function deleteEvent(request: Request, id: string): Promise<void> {
  try {
    const headers = await getAuthHeadersNoContentType(request);
    const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete event: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
} 