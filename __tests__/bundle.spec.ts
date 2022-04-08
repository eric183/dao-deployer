import 'whatwg-fetch';
import { DaoPaaS } from '~/_bundle';

it('allows user to log in', (done) => {
  // render(<LoginForm />)
  const qs = new URLSearchParams(document.location.search.substring(1));
  const userId = qs.get('userId') ? qs.get('userId')! : '1';
  const tenantId = qs.get('tenantId') ? qs.get('tenantId')! : '1';
  const username = qs.get('username') ? qs.get('username')! : 'kuangkuang';
  const dao = new DaoPaaS({
    debug: true,
    userId,
    username,
    tenantId,
    playgroundId: '370288265829416960',
    ticket:
      'MXwzNzAyODgyNjU4Mjk0MTY5NjB8MzgxMjE5NTU4NTY2MDAyNjg4fHwxNzExODczODQ0MDAw',
  });

  done;
  // const daopass = new DaoPaaS({
  //   ticket: 'MXwzNjg1ODM1NDI5MzYwNDM1MjB8MXx8MTY3NzUwMjIzNDAwMA==',
  //   playgroundId: '368583542936043520',
  //   userId: '1',
  //   tenantId: '1',
  //   username: 'ericKuang',
  //   onError: (error) => {
  //     console.log(error);
  //   },
  //   onMessage: (message) => {
  //     console.log(message);
  //   },
  //   // playgroundId: qs.get('playgroundId'),
  //   // playgroundId: qs.get('playgroundId'),
  //   // tenantId: qs.get('tenantId'),
  // });

  // console.log(daopass);
  // await userEvent.type(screen.getByLabelText(/username/i), 'johnUser')
  // userEvent.click(screen.getByRole('button', { name: /submit/i }))
  // await fetch('/login');

  // expect(
  //   await screen.findByText('f79e82e8-c34a-4dc7-a49e-9fadc0979fda'),
  // ).toBeVisible()
  // expect(await screen.findByText('John')).toBeVisible()
  // expect(await screen.findByText('Maverick')).toBeVisible()
});
