import './styles/index.css';
import { Suspense } from 'react';
import ReactDOM, { render, unstable_batchedUpdates } from 'react-dom';
import { useOT } from './hooks';
import { PlaygroundInit } from './helpers/collections/playgroundInit';
import { userStore } from './stores/daoStore';
import { sockerIO, SocketType } from './hooks/collections/useOT';
import { lazy } from '@loadable/component';
import { Loading } from './components/loading';
import { GuiComponent } from './components/Gui';

const LazyPageComponent = lazy(async () => await import('./pages'));
import { fetchReplayList } from './helpers/collections/replay';
import { resetDB } from './helpers/collections/resetter';

// resetDB();

unstable_batchedUpdates(async () => {
  const initClassDIV = document.createElement('div');
  const qs = new URLSearchParams(document.location.search.substring(1));
  const { setSocket } = useOT.getState();
  const { userInfo, setUserInfo } = userStore.getState();

  initClassDIV.className = 'init-class';
  document.body.appendChild(initClassDIV);

  let ticket = qs.get('ticket');
  let playgroundId = qs.get('playgroundId');
  const avatarUrl = qs.get('avatarUrl');

  ticket = ticket
    ? ticket
    : 'MXwzNzAyODgyNjU4Mjk0MTY5NjB8MzgxMjE5NTU4NTY2MDAyNjg4fHwxNzExODczODQ0MDAw';

  playgroundId = playgroundId ? playgroundId : '370288265829416960';

  const response = await fetch('/jssdk/ticket', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ticket }),
  });

  fetchReplayList();

  try {
    const data = await response.json();
    const userId = qs.get('userId')!;

    const socket = new sockerIO({
      ticket,
      playgroundId,
      avatarUrl: avatarUrl
        ? avatarUrl
        : 'https://avatars.githubusercontent.com/u/10773980?v=4',
      // avatarUrl: avatarUrl ? avatarUrl : '',
      username: qs.get('username')!,
      tenantId: '1',
      ioPath: `wss://${data.data}`,
      paasDomain: 'develop.1024paas.com',
    }) as SocketType;
    setSocket(socket);

    setUserInfo({
      userId: userId,
    });

    render(<GuiComponent />, document.querySelector('.init-class'));

    PlaygroundInit<{ ticket?: string; playgroundId?: string; socket: any }>({
      socket,
      ticket,
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
});

ReactDOM.render(
  <Suspense fallback={<Loading />}>
    {/* <CanvasHelper /> */}
    <LazyPageComponent />
  </Suspense>,
  document.querySelector('.edit-container'),
);
