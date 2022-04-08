import { modalStore } from '../stores/modelStore';
import { tokenStore } from '../stores/tokenStore';

export const checkToken = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const token = tokenStore.getState().token;

  if (!token) {
    modalStore.getState().setOpen(true);
  }
};
