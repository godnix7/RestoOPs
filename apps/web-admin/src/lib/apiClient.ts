const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const apiClient = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
          window.location.href = '/login';
        });
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
