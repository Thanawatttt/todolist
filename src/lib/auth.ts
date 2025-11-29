import { writable } from 'svelte/store';
import type { User } from './types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  // Load auth state from localStorage on init
  if (typeof window !== 'undefined') {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        set({
          token: savedToken,
          user: JSON.parse(savedUser),
          isLoading: false,
        });
      } catch {
        // Clear invalid stored data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isLoading: false });
      }
    } else {
      set({ user: null, token: null, isLoading: false });
    }
  }

  return {
    subscribe,
    login: async (username: string, password: string) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      set({ user: data.user, token: data.token, isLoading: false });
    },
    register: async (username: string, email: string, password: string) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      set({ user: data.user, token: data.token, isLoading: false });
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      set({ user: null, token: null, isLoading: false });
    },
    setLoading: (loading: boolean) => {
      update(current => ({ ...current, isLoading: loading }));
    },
    set: (newState: { user: any; token: string; isLoading: boolean }) => {
      set(newState);
    },
  };
}

export const authStore = createAuthStore();
