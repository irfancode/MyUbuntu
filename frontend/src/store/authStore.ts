import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,

      login: async (username: string, password: string) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });

          if (response.ok) {
            const data = await response.json();
            set({
              isAuthenticated: true,
              token: data.access_token,
            });
            
            // Fetch user info
            const userResponse = await fetch('/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${data.access_token}`,
              },
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              set({ user: userData });
            }
            
            return true;
          }
          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);