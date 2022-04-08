import React from 'react';
import { Spinner } from '@chakra-ui/react';
import styled from '@emotion/styled';

type PageLoadingProps = {
  isLoading: boolean;
  children?: React.ReactNode;
};

const LoadingOverlay = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 9999;
  background-color: rgba(26, 26, 26, 0.7);
`;

export const PageLoading: React.FC<PageLoadingProps> = ({
  isLoading,
  children,
}) => {
  return (
    <>
      {isLoading && (
        <LoadingOverlay>
          <Spinner color="red.100" className="absolute right-20 top-20" />
        </LoadingOverlay>
      )}
      {children}
    </>
  );
};
