const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = {
  getToken: () => localStorage.getItem('kk_token'),
  getUser: () => {
    try {
      const u = localStorage.getItem('kk_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setSession: (token, user) => {
    localStorage.setItem('kk_token', token);
    localStorage.setItem('kk_user', JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem('kk_token');
    localStorage.removeItem('kk_user');
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    let res;
    try {
      res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (netErr) {
      throw new Error(
        'Unable to connect to backend server (Port 5000). Please ensure the backend server is running.'
      );
    }

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      throw new Error(data.message || `API request failed (${res.status})`);
    }
    return data;
  },

  // Auth
  login: (phone, password) => api.request('/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) }),
  googleLogin: (payload) => api.request('/auth/google', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getProfile: () => api.request('/auth/profile'),
  updateProfile: (data) => api.request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Centres
  getCentres: () => api.request('/centres'),
  getCentre: (id) => api.request(`/centres/${id}`),
  updateCentreStatus: (id, status, pauseReason) =>
    api.request(`/centres/${id}/status`, { method: 'PATCH', body: JSON.stringify({ operationalStatus: status, pauseReason }) }),

  // Tokens
  bookToken: (payload) => api.request('/tokens/book', { method: 'POST', body: JSON.stringify(payload) }),
  getMyTokens: () => api.request('/tokens/my-tokens'),
  getTokenDetails: (id) => api.request(`/tokens/${id}`),
  cancelToken: (id, reason) => api.request(`/tokens/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  updateTokenStatus: (id, payload) => api.request(`/tokens/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
  getAnalytics: () => api.request('/tokens/analytics'),
  getSlotAvailability: (centreId, date) =>
    api.request(`/tokens/slots-availability?centreId=${centreId}${date ? `&date=${date}` : ''}`),
  getCropStocks: () => api.request('/tokens/crop-stocks'),

  // Queue
  getQueue: (centreId) => api.request(`/queue/${centreId}`),
  callNextToken: (centreId) => api.request(`/queue/${centreId}/next`, { method: 'POST' }),
};
