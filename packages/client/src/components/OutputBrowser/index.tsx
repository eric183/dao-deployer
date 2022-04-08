import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { daoStore } from '~/stores/daoStore';
import { FollowLayout } from '../FollowLayout';
import { BrowserProps } from '~/types/DaoPaaS';
import { theme } from '~/theme';

const PROTOCOL = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';

// export interface OutputBrowserProp {
//   url: string;
//   showURL?: boolean;
//   freshIconColor?: string;
//   inputTextColor?: string;
//   inputBgColor?: string;
//   openIconColor?: string;
//   bgColor?: string;
//   navBgColor?: string;
//   navBorder?: string;
// }

const BrowserLayout = styled.div``;

const NavBar = styled.div<{
  freshIconColor: string;
  openIconColor: string;
  navBgColor: string;
  inputTextColor: string;
  inputBgColor: string;
  navBorder: string;
}>`
  background-color: white;
  height: 30px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  background-color: ${(props) => props.navBgColor};
  box-sizing: content-box;
  .reload {
    color: ${(props) => props.freshIconColor};
  }

  .file-copy {
    color: ${(props) => props.openIconColor};
  }

  input {
    color: ${(props) => props.inputTextColor};
    background-color: ${(props) => props.inputBgColor};
    border: ${(props) => props.navBorder};
  }

  i {
    margin: 0 10px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;

    &.disabled {
      color: #f2fffe;
      &:hover {
        background-color: white;
      }
    }

    &:hover {
      background-color: #e0e0e0;
    }
  }

  input {
    flex: 1;
    display: inline-block;
    height: 26px;
    line-height: 26px;
    padding: 0 8px;
    border-radius: 5px;
  }
`;

const StopMask = styled.div`
  /* width: 100%; */
  /* height: calc(100% - 30px); */
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: #ffffff;
  background-color: #5a5a5a;
  opacity: 0.6;
`;

const OutputBrowser: React.FC<BrowserProps> = ({
  showURL = false,
  bgColor = '#f2f2f2',
  freshIconColor = '#6B6D6C',
  inputTextColor = '#6B6D6C',
  openIconColor = '#6B6D6C',
  // inputBgColor = tailwindConfig.theme.extend?.colors.,
  inputBgColor = theme.extend?.colors['codezone-black'],
  navBgColor = theme.extend?.colors['codezone-black'],
  navBorder = '0 solid transparent',
  ...props
}) => {
  const pStatus = daoStore((state) => state.playgroundStatus);
  const dStatus = daoStore((state) => state.dockerStatus);

  const [playgroundStatus, setPlaygroundStatus] = useState('EMPTY');
  const [dockerStatus, setDockerStatus] = useState('STOP');

  const urlWithProtocol = (url: string): string => {
    // TODO 解除循环渲染page组件
    if (!url) return `${PROTOCOL}showmebug.com`;
    if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
      url = `${PROTOCOL}${url}`;
    }
    return url;
  };

  useEffect(() => {
    setPlaygroundStatus(pStatus);
  }, [pStatus]);
  useEffect(() => {
    setDockerStatus(dStatus);
    setTimeout(() => {
      onRefresh();
    }, 800);
  }, [dStatus]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeSrc, setIframeSrc] = useState(
    urlWithProtocol(daoStore.getState().dockerInfo?.url as string),
  );
  // useEffect(() => {
  //   setIframeSrc(urlWithProtocol(url));
  // }, [url]);

  useEffect(() => {
    // iframeRef.current.contentWindow.addEventListener('message', (e) => {
    //   // console.log(`post message from parent`, e.data);
    //   switch (e.data) {
    //     case 'forward':
    //       iframeRef.current.contentWindow.history.forward();
    //       return;
    //     case 'backward':
    //       iframeRef.current.contentWindow.history.back();
    //       return;
    //     case 'refresh':
    //       // console.log(`???????`);
    //       iframeRef.current.contentWindow.location.reload();
    //       return;
    //   }
    // });
  }, [iframeRef]);

  // TO FIXED any;
  const onEnterKey = (e: any) => {
    if (e.keyCode !== 13) return;
    const url = urlWithProtocol(e.target.value);
    setIframeSrc(url);
    iframeRef?.current?.contentWindow?.location.replace(url);
  };

  const onBackward = () => {
    iframeRef?.current?.contentWindow?.history.back();
  };

  const onForward = () => {
    iframeRef?.current?.contentWindow?.history.back();
  };

  const onRefresh = () => {
    // iframeRef?.current?.contentWindow?.location.reload();
    iframeRef?.current?.contentWindow?.location.replace(iframeSrc);
  };

  const onOpenInNewTab = () => {
    window.open(iframeSrc);
  };
  useEffect(() => {
    if (playgroundStatus === 'EMPTY') return;
    setIframeSrc(
      urlWithProtocol(daoStore.getState().dockerInfo?.url as string),
    );
    if (playgroundStatus === 'ACTIVE' && dockerStatus === 'RUNNING') {
      if (iframeSrc !== 'http://' && iframeSrc !== 'https://') {
        iframeRef?.current?.contentWindow?.location.replace(iframeSrc);
      }
    }
  }, [playgroundStatus, dockerStatus]);

  return (
    <FollowLayout name="browser">
      <BrowserLayout className="browser-container w-full h-full flex flex-col">
        {/* <div className={props.className ? props.className : ''}> */}
        {showURL ? (
          <NavBar
            navBgColor={navBgColor}
            freshIconColor={freshIconColor}
            inputTextColor={inputTextColor}
            inputBgColor={inputBgColor}
            openIconColor={openIconColor}
            navBorder={navBorder}
          >
            <i
              className="d42 text-xl reload cursor-pointer"
              onClick={onRefresh}
            />
            <input
              type="text"
              value={iframeSrc}
              onChange={(e) => setIframeSrc(e.target.value)}
              onKeyDown={onEnterKey}
            />
            <i
              className="d42 text-xl file-copy cursor-pointer"
              onClick={onOpenInNewTab}
            />
          </NavBar>
        ) : null}

        <div className="flex-1 relative">
          {dockerStatus === 'STOP' && (
            <StopMask className="h-full w-full">
              <span>点击“运行”，启动应用</span>
            </StopMask>
          )}
          <iframe
            className="h-full w-full"
            ref={iframeRef}
            src={iframeSrc}
            // style={{ width: '100%', height: 'calc(100% - 30px)' }}
          />
        </div>
        {/* </div> */}
      </BrowserLayout>
    </FollowLayout>
  );
};

export default OutputBrowser;
