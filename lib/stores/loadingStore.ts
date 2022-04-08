import create from 'zustand';

export const loadingStore = create<{
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
}>((set) => {
  return {
    isLoading: false,
    setLoading: (arg) => {
      set({ isLoading: arg });
    },
  };
});
