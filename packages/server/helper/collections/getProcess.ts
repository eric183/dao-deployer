import * as dotenv from 'dotenv';
import * as path from 'path';
// import * as chalk from 'chalk';

// const user = 'admin';
// const origin = 'amqp-zxj2oxdrndje.rabbitmq.ap-gz.public.tencenttdmq.com';
// const password =
//   'eyJrZXlJZCI6ImFtcXAtenhqMm94ZHJuZGplIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiJhbXFwLXp4ajJveGRybmRqZV9hZG1pbiJ9.sUuKgwUqYYG4XsJwwlcmekvfw6zzgCv-7rLrBchMqrU';
// const vhost = '/amqp-zxj2oxdrndje|dev1';
// const port = '5672';
export default () => {
  // console.log(process.cwd());
  dotenv.config({
    path: path.join(
      process.cwd(),
      '../..',
      process.env.ENV_NODE === 'production' ? '.env.production' : '.env',
    ),
  });
};
