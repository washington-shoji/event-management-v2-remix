import { getToken } from '~/utils/auth.server';

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

export type EventAttendeeStatus = 'registered' | 'checked_in' | 'cancelled' | 'no_show' | 'completed';

export interface EventAttendee {
  id: string;
  eventId: string;
  userId: string;
  registrationDate: string;
  status: EventAttendeeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventAttendeeInput {
  eventId: string;
  userId: string;
  status?: EventAttendeeStatus;
}

export interface UpdateEventAttendeeInput {
  status?: EventAttendeeStatus;
}

// Attendee Ticket Types
export interface AttendeeTicket {
  id: string;
  attendeeId: string;
  ticketId: string;
  quantity: number;
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttendeeTicketInput {
  attendeeId: string;
  ticketId: string;
  quantity: number;
}

export interface UpdateAttendeeTicketInput {
  quantity: number;
}

// 1. Register for an Event
export async function registerForEvent(request: Request, data: CreateEventAttendeeInput): Promise<EventAttendee> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/event-attendees`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to register for event: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error registering for event:', error);
    throw error;
  }
}

// 2. Get All Event Attendees
export async function getAllEventAttendees(request: Request): Promise<EventAttendee[]> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/event-attendees`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch attendees: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching all event attendees:', error);
    throw error;
  }
}

// 3. Get Attendee by ID
export async function getAttendeeById(request: Request, id: string): Promise<EventAttendee> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/event-attendees/${id}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch attendee: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching attendee by ID:', error);
    throw error;
  }
}

// 4. Get Attendees for an Event
export async function getEventAttendees(request: Request, eventId: string): Promise<EventAttendee[]> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/attendees`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch event attendees: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching event attendees:', error);
    throw error;
  }
}

// 5. Get User's Event Registrations
export async function getUserEventRegistrations(request: Request, userId: string): Promise<EventAttendee[]> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/event-attendees`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user registrations: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching user event registrations:', error);
    throw error;
  }
}

// 6. Update Attendee Status
export async function updateAttendeeStatus(request: Request, id: string, data: UpdateEventAttendeeInput): Promise<EventAttendee> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/event-attendees/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update attendee status: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error updating attendee status:', error);
    throw error;
  }
}

// 7. Cancel Registration
export async function cancelRegistration(request: Request, id: string): Promise<EventAttendee> {
  try {
    const headers = await getAuthHeadersNoContentType(request);
    const response = await fetch(`${API_BASE_URL}/api/event-attendees/${id}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to cancel registration: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error canceling registration:', error);
    throw error;
  }
}

// Attendee Ticket Management Functions

// 1. Purchase Tickets
export async function purchaseTickets(request: Request, data: CreateAttendeeTicketInput): Promise<AttendeeTicket> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/attendee-tickets`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to purchase tickets: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error purchasing tickets:', error);
    throw error;
  }
}

// 2. Get All Attendee Tickets
export async function getAllAttendeeTickets(request: Request): Promise<AttendeeTicket[]> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/attendee-tickets`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch attendee tickets: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching all attendee tickets:', error);
    throw error;
  }
}

// 3. Get Attendee Ticket by ID
export async function getAttendeeTicketById(request: Request, id: string): Promise<AttendeeTicket> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/attendee-tickets/${id}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch attendee ticket: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching attendee ticket by ID:', error);
    throw error;
  }
}

// 4. Get Tickets for an Attendee
export async function getAttendeeTickets(request: Request, attendeeId: string): Promise<AttendeeTicket[]> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/attendees/${attendeeId}/tickets`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch attendee tickets: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching attendee tickets:', error);
    throw error;
  }
}

// 5. Get Attendees for a Ticket Type
export async function getTicketAttendees(request: Request, ticketId: string): Promise<AttendeeTicket[]> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/attendees`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ticket attendees: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching ticket attendees:', error);
    throw error;
  }
}

// 6. Update Ticket Quantity
export async function updateTicketQuantity(request: Request, id: string, data: UpdateAttendeeTicketInput): Promise<AttendeeTicket> {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${API_BASE_URL}/api/attendee-tickets/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update ticket quantity: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error updating ticket quantity:', error);
    throw error;
  }
}

// 7. Cancel Ticket Purchase
export async function cancelTicketPurchase(request: Request, id: string): Promise<AttendeeTicket> {
  try {
    const headers = await getAuthHeadersNoContentType(request);
    const response = await fetch(`${API_BASE_URL}/api/attendee-tickets/${id}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to cancel ticket purchase: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error canceling ticket purchase:', error);
    throw error;
  }
} 