import create from 'zustand';
import { AlertStatus } from '@chakra-ui/alert';

export interface AlertInfo {
  title?: string;
  status: AlertStatus;
  desc: string;
}

export const alertStore = create<{
  alertInfo: AlertInfo;
  setAlertInfo: (alertInfo: AlertInfo) => void;
}>((set) => {
  return {
    alertInfo: null!,
    setAlertInfo: (arg) => {
      set({ alertInfo: arg });
    },
  };
});
