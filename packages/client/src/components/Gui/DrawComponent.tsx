import dayjs from 'dayjs';
import { FC, useEffect, useState } from 'react';
import { Drawer, Input, InputGroup, Placeholder } from 'rsuite';
import { CRDTKeyToVal } from '~/enum/CRDTKeyToVal';
import { replay } from '~/helpers/collections/replay';
// import { CRDTKeyToVal } from '~/enum/crdtKeyToVal';
import { userListStore } from '~/stores/daoStore';
import { ReplaySourceType } from '~/types/crdt';

import { MdOutlinePersonOutline } from 'react-icons/md';

export const DrawerComponent: FC<{
  drawerOpen: boolean;
  setDrawerOpen: (val: boolean) => void;
  replayList?: ReplaySourceType[];
  option?: {
    title?: string;
    value: string;
    type?: string;
  };
}> = ({ drawerOpen, setDrawerOpen, replayList, option }) => {
  const [filterVal, setFilterVal] = useState<string>('');

  useEffect(() => {
    // bindText(replayLst);
  }, [replayList]);
  // console.log('replayList', replayList);
  return (
    <Drawer
      size="lg"
      placement="right"
      // placement="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
    >
      <Drawer.Header>
        <Drawer.Title>
          {!option ? '回放列表' : option.title ? option.title : ''}
        </Drawer.Title>
        <Drawer.Actions>
          <InputGroup>
            <InputGroup.Addon>
              <MdOutlinePersonOutline size="1.5em" />
            </InputGroup.Addon>
            <Input
              onChange={(evt) => {
                setFilterVal(evt);
              }}
            />
          </InputGroup>
          {/* <Button onClick={() => setOpenWithHeader(false)}>Cancel</Button>
      <Button
        onClick={() => setOpenWithHeader(false)}
        appearance="primary"
      >
        Confirm
      </Button> */}
        </Drawer.Actions>
      </Drawer.Header>
      <Drawer.Body>
        {replayList ? (
          <div>
            <ul
              role="list"
              className="marker:text-sky-400 list-disc pl-5 space-y-3 text-gray-400"
            >
              {filterVal
                ? replayList
                    .filter(
                      (item) =>
                        userListStore
                          .getState()
                          .userList.find((user) => user.userId === item.userId)!
                          .username!.indexOf(filterVal) >= 0,
                    )
                    .map((item, index) => (
                      <li
                        key={index}
                        className="hover:ring-sky-500 cursor-pointer"
                        onClick={() => {
                          // bindText(item);
                          setDrawerOpen(false);
                          replay({
                            // userId: item.userInfo.userId!,
                            timestamp: item.timestamp!,
                          });
                        }}
                      >
                        {
                          CRDTKeyToVal[
                            item.event as keyof Partial<typeof CRDTKeyToVal>
                          ]
                        }

                        <span
                          className="mx-4"
                          style={{
                            color: userListStore
                              .getState()
                              .userList.find(
                                (user) => user.userId === item.userId,
                              )?.color,
                          }}
                        >
                          {
                            userListStore
                              .getState()
                              .userList.find(
                                (user) => user.userId === item.userId,
                              )?.username
                          }
                        </span>

                        <span>
                          【
                          {dayjs(Number(item.timestamp)).format(
                            'YYYY-DD-MM   hh:mm:ss',
                          )}
                          】
                        </span>
                      </li>
                    ))
                : replayList.map((item, index) => (
                    <li
                      key={index}
                      className="hover:ring-sky-500 cursor-pointer"
                      onClick={() => {
                        // bindText(item);
                        setDrawerOpen(false);
                        replay({
                          userId: item.userId,
                          timestamp: item.timestamp!,
                        });
                      }}
                    >
                      {
                        CRDTKeyToVal[
                          item.event as keyof Partial<typeof CRDTKeyToVal>
                        ]
                      }

                      <span
                        className="mx-4"
                        style={{
                          color: userListStore
                            .getState()
                            .userList.find(
                              (user) => user.userId === item.userId,
                            )?.color,
                        }}
                      >
                        {
                          userListStore
                            .getState()
                            .userList.find(
                              (user) => user.userId === item.userId,
                            )?.username
                        }
                      </span>

                      <span>
                        【
                        {dayjs(Number(item.timestamp)).format(
                          'YYYY-DD-MM   hh:mm:ss',
                        )}
                        】
                      </span>
                    </li>
                  ))}
            </ul>
          </div>
        ) : (
          <Placeholder.Paragraph style={{ marginTop: 30 }} />
        )}
      </Drawer.Body>
    </Drawer>
  );
};
