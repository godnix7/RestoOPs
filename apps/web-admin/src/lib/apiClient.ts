const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (res.status === 401) {
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
};
