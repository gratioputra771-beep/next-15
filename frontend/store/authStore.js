import { create } from 'zustand';
import Cookies from 'js-cookie';
import { authAPI } from '../lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  init: async () => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const res = await authAPI.me();
      set({ user: res.data.data, token, isAuthenticated: true, isLoading: false });
    } catch {
      Cookies.remove('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: (token, user) => {
    Cookies.set('token', token, { expires: 1 });
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    Cookies.remove('token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
    window.location.href = '/login';
  },
}));

export default useAuthStore;
