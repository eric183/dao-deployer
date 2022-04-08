import styled from '@emotion/styled';
import React, { ReactNode } from 'react';
import { IsMe } from '~/helpers';
import { ignoreReplayerStore } from '~/stores/ignoreReplayerStore';
import { daoStore, shadowUserStore } from '~/stores/daoStore';
import { Avatar } from '../Avatar';
import Skeleton from '../Skeleton';

const FROZEN_CONTROL_COMPONENTS: (keyof Dao_FrontType.CRDT)[] = [
  'editor',
  'file',
  'terminal',
];

const UserCardLayout = styled.div<{
  shadowUser: Dao_FrontType.UserInfo;
}>`
  position: absolute;
  right: 0;
  top: -1.5rem;
  padding: 0 2rem;
  background: ${(props) => props.shadowUser.color}5c;
  border: 1px solid ${(props) => props.shadowUser.color};
  border-radius: 5px 5px 0 0;

  span {
    font-size: 12px;
    color: #fff;
  }
`;

const FollowLayoutWrapper = styled.div<{
  user: Dao_FrontType.UserInfo;
  isPass: boolean;
}>`
  width: 100%;
  height: 100%;
  position: relative;

  &:after {
    display: ${(props) =>
      props?.user?.color && props.isPass ? 'block' : 'none'};
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 0;
    border-width: 4px 3px;
    border-radius: 2px;
    border-color: ${(props) =>
      props?.user?.color && props.isPass ? props?.user?.color : 'transparent'};
    border-style: solid;
  }
`;
export const FollowLayout: React.FC<{
  className?: string;
  name?: string;
  chilren?: unknown;
}> = ({ className = '', children, name }) => {
  const shadowUser = shadowUserStore((state) => state.shadowUser);
  const { switchShadowUser } = shadowUserStore.getState();
  const asyncType = daoStore((state) => state.asyncType);
  const setAsyncType = daoStore((state) => state.setAsyncType);
  // useMemo(()=> )
  // console.log(asyncType);
  const isPass: boolean | undefined | string =
    asyncType === name && shadowUser?.userId && !IsMe(shadowUser.userId!);
  return (
    <FollowLayoutWrapper
      user={shadowUser}
      className={`follow-layout`}
      isPass={isPass as boolean}
      onClick={() => {
        if (!shadowUser?.uuid) return;
        setAsyncType(undefined);
        switchShadowUser(undefined);
      }}
      onKeyDown={() => {
        if (!shadowUser?.uuid) return;
        setAsyncType(undefined);
        switchShadowUser(undefined);
      }}
      onScroll={() => {
        if (!shadowUser?.uuid) return;
        setAsyncType(undefined);
        switchShadowUser(undefined);
      }}
      onWheel={() => {
        if (!shadowUser?.uuid) return;
        setAsyncType(undefined);
        switchShadowUser(undefined);
      }}
    >
      {/* <UserCardLayout
        className="userCard flex items-center justify-between"
        shadowUser={shadowUser}
      >
        <Avatar user={shadowUser} />
        <span>
          {' '}
          {shadowUser?.username + '   '}
          视角
        </span>
      </UserCardLayout> */}
      {daoStore.getState().amDoing === 'replaying' &&
      FROZEN_CONTROL_COMPONENTS.some((d) => d === name) ? (
        <Freezer />
      ) : null}

      {children}
    </FollowLayoutWrapper>
  );
};

const FreezerLayout = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 999;

  .freezer-content {
    width: 100%;
    height: 100%;
    position: absolute;
  }
`;
const Freezer: React.FC<{ children?: ReactNode }> = ({ children }) => (
  <FreezerLayout>{children}</FreezerLayout>
);
