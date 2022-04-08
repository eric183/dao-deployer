import styled from '@emotion/styled';
import React, { useEffect, useMemo } from 'react';
import { avatarGenerator } from '~/helpers';
import { daoStore } from '~/stores';
// import {random}

const AvatarLayout = styled.div<{
  user: Dao_FrontType.UserInfo;
  width?: number;
  height?: number;
}>`
  border-color: ${(props) => props.user.color};
  color: ${(props) => props.user.color};
  font-size: 12px;
  background-image: ${(props) => 'url("' + props.user.avatarUrl + '")'};
  background-size: cover;
  background-position: center;
  background-color: ${(props) =>
    props.user.avatarUrl ? 'transparent' : '#d2d2d2'};
  background-repeat: no-repeat;
`;
export const Avatar: React.FC<{
  user: Dao_FrontType.UserInfo;
  width?: number;
  height?: number;
  [key: string]: unknown;
}> = ({ user, ...props }) => {
  return (
    <AvatarLayout
      className="avatar-container rounded-full motion-safe:hover:scale-110 h-8 w-8 self-center bg-cover bg-no-repeat bg-center border-2 flex justify-center"
      user={user}
      {...props}

      // style={{ backgroundImage: 'url(' + url + ')' }}
      // style={{
      //   borderColor: user.color,
      //   backgroundImage: `url(https://avatars.dicebear.com/api/big-ears-neutral/${user.name}.svg)`,
      // }}
    >
      {!user.avatarUrl ? (
        <span className="absolute z-10 self-center">
          {user.username?.substring(0, 1)}
        </span>
      ) : null}
    </AvatarLayout>
  );
};
