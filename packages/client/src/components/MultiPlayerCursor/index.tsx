import styled from '@emotion/styled';
import { omit, pick, throttle } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useOT } from '~/hooks';
import shallow from 'zustand/shallow';

import {
  daoStore,
  syncCursorStore,
  userListStore,
  userStore,
} from '~/stores/daoStore';
import { IsMe } from '~/helpers';

interface CUser extends Dao_FrontType.UserInfo {
  cursor: any;
}

const width = '20';
const height = '20';
const MultiPlayerCursorLayout = styled.svg<{
  width: string;
  height: string;
  // top: number;
  // left: number;
  color?: string;
}>`
  position: fixed;
  left: 0;
  top: 0;

  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  z-index: 9;
  transition: all 0.3s;
`;

export const MultiPlayerCursor: React.FC<{
  userInfo?: Dao_FrontType.UserInfo;
}> = () => {
  const [users, setUsers] = useState<CUser[]>(null!);
  const CRDTInfo = daoStore((state) => state.CRDTInfo);

  const getImageUrl = (color: string, cursorSize = '20') => {
    return `url("data:image/svg+xml,%3C%3Fxml version='1.0' standalone='no'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg t='1641371763305' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='4512' xmlns:xlink='http://www.w3.org/1999/xlink' width='${cursorSize}' height='${cursorSize}' %3E%3Cdefs%3E%3Cstyle type='text/css'%3E%3C/style%3E%3C/defs%3E%3Cpath d='M370.048 97.706667L815.786667 403.285333c90.410667 61.994667 66.176 201.472-39.808 229.376l-167.893334 44.202667 123.648 214.101333a32 32 0 1 1-55.466666 32l-123.605334-214.101333-122.24 123.306667c-77.141333 77.824-210.048 29.013333-218.538666-80.213334l-41.813334-538.88C161.706667 105.941333 281.344 36.864 370.048 97.706667z m-36.181333 52.736C290.986667 121.088 233.813333 152.32 233.642667 202.709333l0.213333 5.461334 41.813333 538.88c4.138667 52.693333 66.048 77.226667 105.045334 44.032l4.266666-3.925334 121.002667-122.112a192 192 0 0 1 76.544-47.274666l10.922667-3.242667 166.272-43.733333c51.072-13.44 64.170667-78.762667 24.490666-111.232l-4.608-3.413334L333.866667 150.4z' fill='#49cf5b' p-id='4513'%3E%3C/path%3E%3C/svg%3E")`;
  };

  const throttled = throttle((a) => {
    useOT.getState()?.socket?.emit('extraSync', JSON.stringify(a));
  }, 300);
  useEffect(() => {
    const { userList } = userListStore.getState();
    if (userList.length === 0) return;
    setUsers(
      (userList as CUser[]).map((_user) => {
        if (_user.uuid === CRDTInfo.userId) {
          _user.cursor = CRDTInfo.extendInfo;
        }
        return _user;
      }),
    );
  }, [CRDTInfo]);
  useEffect(() => {
    const { userInfo } = userStore.getState();
    window.addEventListener(
      'mousemove',
      (evt) => {
        const { globalData } = daoStore.getState();
        if (!globalData.syncCursor) return;
        const crdt: Dao_FrontType.CRDT = {
          timestamp: Date.now(),
          userId: userInfo.userId,
          extendInfo: {
            type: 'mousemove',
            left: evt.clientX.toFixed(3),
            top: evt.clientY.toFixed(3),
            width: window.innerWidth,
            height: window.innerHeight,
          },
        };
        throttled(crdt);
      },
      false,
    );
  }, []);

  // console.log(daoStore.getState().globalData.syncCursor);
  return (
    <>
      {daoStore.getState().globalData.syncCursor &&
        users?.map((item, index) =>
          !IsMe(item.userId!) ? (
            <MultiPlayerCursorLayout
              xmlns="http://www.w3.org/2000/svg"
              key={index}
              width={width}
              height={height}
              viewBox="0 0 1024 1024"
              className={`multi-player ${
                (Number(item.cursor?.top) * window.innerHeight) /
                item.cursor?.height
              }///${item.cursor?.top}`}
              version="1.1"
              p-id="4512"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              color={item.color!}
              style={{
                left: `${
                  (Number(item.cursor?.left) * window.innerWidth) /
                  item.cursor?.width
                }px`,
                top: `${
                  (Number(item.cursor?.top) * window.innerHeight) /
                  item.cursor?.height
                }px`,
              }}
            >
              <defs>
                <style type="text/css"></style>
              </defs>
              <path
                d="M370.048 97.706667L815.786667 403.285333c90.410667 61.994667 66.176 201.472-39.808 229.376l-167.893334 44.202667 123.648 214.101333a32 32 0 1 1-55.466666 32l-123.605334-214.101333-122.24 123.306667c-77.141333 77.824-210.048 29.013333-218.538666-80.213334l-41.813334-538.88C161.706667 105.941333 281.344 36.864 370.048 97.706667z m-36.181333 52.736C290.986667 121.088 233.813333 152.32 233.642667 202.709333l0.213333 5.461334 41.813333 538.88c4.138667 52.693333 66.048 77.226667 105.045334 44.032l4.266666-3.925334 121.002667-122.112a192 192 0 0 1 76.544-47.274666l10.922667-3.242667 166.272-43.733333c51.072-13.44 64.170667-78.762667 24.490666-111.232l-4.608-3.413334L333.866667 150.4z"
                fill={item.color!}
                p-id="4513"
              ></path>
            </MultiPlayerCursorLayout>
          ) : null,
        )}
    </>
  );
};
