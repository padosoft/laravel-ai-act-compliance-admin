import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/admin/ai-act-compliance',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});
