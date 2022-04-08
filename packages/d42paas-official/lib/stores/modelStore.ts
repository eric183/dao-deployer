import create from 'zustand';

export const modalStore = create<{
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}>((set) => {
  return {
    isOpen: false,
    setOpen: (arg) => {
      set({ isOpen: arg });
    },
  };
});
