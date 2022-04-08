/// <reference types="../../src/types" />
import { useEffect, useLayoutEffect, useState } from 'react';
import { DaoPaaS } from '~/_bundle';
import './dev.css';
// import { DaoPaaS } from '@dao42/d42paas-front';
// import '@dao42/d42paas-front/style.css';

function App() {
  const [count, setCount] = useState(0);
  useLayoutEffect(() => {
    const qs = new URLSearchParams(document.location.search.substring(1));
    const userId = qs.get('userId') ? qs.get('userId')! : '1';
    const tenantId = qs.get('tenantId') ? qs.get('tenantId')! : '1';
    const username = qs.get('username') ? qs.get('username')! : 'kuangkuang';
    // https://develop.1024paas.com/?userId=1&username=eric&tenantId=1&playground 364948495318253568Id=364948495318253568&ticket=MXwzNjQ5NDg0OTUzMTgyNTM1Njh8MXxudWxsfDE4OTU2NTMzODMwMDA=
    const Dao = new DaoPaaS({
      username,
      tenantId,
      // debug: true,
      // playgroundId: '364948495318253568',
      // playgroundId: '365255291287240704',

      // playgroundId: '365255291287240704',
      // playgroundId: '365255291287240704',
      // playgroundId: '368583542936043520',
      // playgroundId: '370288265829416960',
      playgroundId: '368583542936043520',
      // ticket: 'MXwzNjQ5NDg0OTUzMTgyNTM1Njh8MXxudWxsfDE4OTU2NTMzODMwMDA=',
      // ticket: 'MXwzNjUyNTUyOTEyODcyNDA3MDR8MXxudWxsfDE4OTU2NTMzODMwMDA=',
      // ticket: 'MXwzNzAyODgyNjU4Mjk0MTY5NjB8MXxudWxsfDE4OTU2NTMzODMwMDA=',
      ticket: 'MXwzNjg1ODM1NDI5MzYwNDM1MjB8MXx8MTY3NzUwMjIzNDAwMA==',
      // serviceWorkerOrigin: 'https://develop.1024paas.com',
      components: [
        {
          container: '.Shell',
          item: 'Editor',
          props: {
            // theme: {
            //   background: '#fff',
            // },
          },
        },
      ],
      onMessage: (message) => {
        console.log(message);
      },
      onError: (error) => {
        // debugger;
      },
    });
    setTimeout(() => {
      Dao.dispose();
    }, 2000);
  });

  // useEffect(() => {

  //   // setTimeout(() => {
  //   //   Dao.followUser('1', (d) => {
  //   //     debugger;
  //   //   });
  //   // }, 2000);

  //   // setTimeout(() => {
  //   //   Dao.followUser({
  //   //     username: 'libai',
  //   //     userId: 2,
  //   //   });
  //   // }, 3000);
  //   // @ts-ignore: Unreachable code error
  //   window.Dao = Dao;

  //   // @ts-ignore: Unreachable code error
  //   window.active = Dao.activePlayground;
  // }, []);
  return (
    <>
      <div className="App">
        <div className="Shell"></div>
        {/* <div className="Tree"></div>
        <div className="editor-content">
          <div className="Editor"></div>
        </div> */}
      </div>
    </>
  );
}

export default App;
