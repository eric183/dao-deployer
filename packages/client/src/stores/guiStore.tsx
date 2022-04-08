import create from 'zustand';

export const guiStore = create<{
  showGUI: boolean;
  setShowGUI: (arg: boolean) => void;
}>((set) => ({
  showGUI: false,
  setShowGUI: (arg: boolean) => set(() => ({ showGUI: arg })),
}));
