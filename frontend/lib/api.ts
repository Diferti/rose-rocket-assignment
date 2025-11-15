import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Location {
  city: string;
  postal_code?: string;
  state_province?: string;
  country: 'US' | 'CA' | 'MX';
}

export interface QuoteRequest {
  origin: Location;
  destination: Location;
  equipment_type: 'dry van' | 'reefer' | 'flatbed' | 'step deck' | 'hotshot' | 'straight truck';
  total_weight?: number;
  pickup_date?: string;
}

export interface Quote {
  id: number;
  origin_city: string;
  origin_postal_code?: string;
  origin_state_province?: string;
  origin_country: string;
  destination_city: string;
  destination_postal_code?: string;
  destination_state_province?: string;
  destination_country: string;
  lane: string;
  equipment_type: string;
  total_weight?: number;
  pickup_date?: string;
  distance_miles?: number;
  distance_kilometers?: number;
  quote_amount: number;
  created_at: string;
  updated_at: string;
}

export interface QuoteResponse {
  success: boolean;
  message: string;
  data: Quote & {
    geocoding_accuracy?: {
      origin: string;
      destination: string;
    };
  };
}

export interface QuotesListResponse {
  success: boolean;
  data: Quote[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API functions
export const quoteAPI = {
  // Create a new quote
  create: async (quoteData: QuoteRequest): Promise<QuoteResponse> => {
    const response = await api.post<QuoteResponse>('/api/quotes', quoteData);
    return response.data;
  },

  // Get all quotes
  getAll: async (page = 1, limit = 10): Promise<QuotesListResponse> => {
    const response = await api.get<QuotesListResponse>('/api/quotes', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get quote by ID
  getById: async (id: number): Promise<{ success: boolean; data: Quote }> => {
    const response = await api.get<{ success: boolean; data: Quote }>(
      `/api/quotes/${id}`
    );
    return response.data;
  },

  // Health check
  health: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.get<{ success: boolean; message: string }>(
      '/health'
    );
    return response.data;
  },
};

