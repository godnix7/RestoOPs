const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (res.status === 401) {
      // Logic for refresh token call could go here
      // For now, redirect to login if truly unauthorized
      if (typeof window !== 'undefined' && !endpoint.includes('/auth')) {
        window.location.href = '/login';
      }
    }

    return res;
  },

  async get(endpoint: string, options: RequestInit = {}) {
    return this.fetch(endpoint, { ...options, method: 'GET' });
  },

  async post(endpoint: string, body: any, options: RequestInit = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async patch(endpoint: string, body: any, options: RequestInit = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
};
