import {
  Alert as AlertComponent,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react';
import { FC } from 'react';
import { AlertInfo } from '../lib/stores/alertStore';

export const Alert: FC<AlertInfo> = ({ title, status, desc }) => {
  return (
    <AlertComponent status={status}>
      <AlertIcon />
      <AlertTitle mr={2}>{title}</AlertTitle>
      <AlertDescription className="text-center">{desc}</AlertDescription>
      <CloseButton position="absolute" right="8px" top="8px" />
    </AlertComponent>
  );
};
