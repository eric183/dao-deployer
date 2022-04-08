import React, { useEffect, useState } from 'react';
import { daoStore } from '~/stores/daoStore';
import styled from '@emotion/styled';
import { useOT } from '~/hooks';

type ToolBarProps = {
  className?: string;
};

const ToolBarWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding-right: 4rem;
`;

const ButtonWrapper = styled.div`
  align-self: center;
  color: #e9f3f0;
  width: auto;
  /* height: 40px; */
  /* padding-left: 8px;
  padding-right: 8px; */
  padding: 7px 16px;
  border-radius: 8px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  /* background-color: rgb(48, 89, 182); */
  background-color: #1bb380;

  cursor: pointer;
  &.disabled {
    background-color: #524e4e;
    cursor: not-allowed;
  }

  &.pro-running {
    background-color: red;
  }
`;

const ButtonContent: React.FC<{
  playgroundStatus: string;
  dockerStatus: string;
}> = ({ playgroundStatus, dockerStatus }) => {
  return (
    <>
      {(() => {
        switch (playgroundStatus) {
          case 'EMPTY':
            return (
              <>
                <i className="w-5 h-5 mr-2.5 text-sm d42 loading text-white animate-spin flex justify-center items-center" />
                <div>加载中...</div>
              </>
            );
          case 'ACTIVE':
            return dockerStatus === 'STOP' ? (
              <>
                <i className="w-5 h-5 mr-2.5 text-sm d42 run-solid text-white flex justify-center items-center" />
                <div>运行</div>
              </>
            ) : (
              dockerStatus === 'RUNNING' && (
                <>
                  <i className="w-5 h-5 mr-2.5 text-sm d42 stop text-white flex justify-center items-center" />
                  <div>停止运行</div>
                </>
              )
            );
          case 'INACTIVE':
            return (
              <>
                <i className="w-5 h-5 mr-2.5 self-center text-xl d42 cloud-offline-outline flex justify-center items-center" />
                <div>激活</div>
              </>
            );
          default:
            return <></>;
        }
      })()}
    </>
  );
};

const ToolBar: React.FC<ToolBarProps> = ({ ...props }) => {
  const io = useOT.getState().socket;

  const pStatus = daoStore((state) => state.playgroundStatus);
  const dStatus = daoStore((state) => state.dockerStatus);

  const [playgroundStatus, setPlaygroundStatus] = useState('EMPTY');
  const [dockerStatus, setDockerStatus] = useState('STOP');

  useEffect(() => {
    setPlaygroundStatus(pStatus);
  }, [pStatus]);
  useEffect(() => {
    setDockerStatus(dStatus);
  }, [dStatus]);

  const onRun = () => {
    if (daoStore.getState().playgroundStatus === 'ACTIVE') {
      io?.emit('run');
    } else if (daoStore.getState().playgroundStatus === 'INACTIVE') {
      io?.emit('active');
    }
  };
  const onStop = () => {
    io?.emit('stop');
  };

  const [netStatus, setNetStatus] = useState<'WEAK_NET' | 'ONLINE' | 'OFFLINE'>(
    'ONLINE',
  );

  const [NestSpeed, setNestSpeed] = useState<number>(0);
  useEffect(() => {
    window.addEventListener('online', () => {
      setNetStatus('ONLINE');
    });
    window.addEventListener('offline', () => {
      setNetStatus('OFFLINE');
    });

    // const timer = setInterval(() => {
    //   const connection = window.navigator.connection.downlink;
    //   if (connection && connection.downlink) {
    //     setNestSpeed(connection.downlink * 1024);
    //     // return (connection.downlink * 1024) / 8;
    //   }
    // }, 1000);
    // return () => {
    //   clearInterval(timer);
    // };
  }, [NestSpeed]);

  // let NestIcon;
  // if (NestSpeed <= 300) {
  //   NestIcon = (
  //     <i className="d42 loading text-xl text-white animate-spin absolute -right-2" />
  //   );
  // }

  // if (netStatus === 'OFFLINE') {
  //   NestIcon = (
  //     <i className="d42 offline text-xl text-white animate-spin absolute -right-2" />
  //   );
  // }

  // console.log(NestSpeed);
  //   return null;
  // };
  return (
    <ToolBarWrapper>
      <ButtonWrapper
        onClick={
          playgroundStatus === 'INACTIVE' || dockerStatus === 'STOP'
            ? onRun
            : onStop
        }
        className={[
          playgroundStatus === 'EMPTY' ? 'disabled' : '',
          playgroundStatus === 'ACTIVE' && dockerStatus === 'RUNNING'
            ? 'pro-running'
            : '',
        ].join(' ')}
        {...props}
      >
        <ButtonContent
          playgroundStatus={playgroundStatus}
          dockerStatus={dockerStatus}
        />
      </ButtonWrapper>
      {/* <NestIcon /> */}
    </ToolBarWrapper>
  );
};

export default ToolBar;
