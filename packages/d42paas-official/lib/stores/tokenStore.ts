import create from 'zustand';
import { persist } from 'zustand/middleware';

export const tokenStore = create<{
  token: string;
  setToken: (token: string) => void;
}>(
  persist(
    (set) => {
      return {
        token: '',
        setToken: (token: string) => {
          set({ token });
        },
      };
    },
    {
      name: 'token',
      getStorage: () => localStorage,
    },
  ),
);
