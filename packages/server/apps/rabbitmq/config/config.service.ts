import { Logger } from '@nestjs/common';
import getProcess from 'helper/collections/getProcess';

getProcess();

// console.log(process.env.RABBITMQ, 'hahahahahh');
const user = process.env.RABBITMQ_USER;
const password = process.env.RABBITMQ_PASSWORD;
const origin = process.env.RABBITMQ_ORIGIN;
const vhost = process.env.RABBITMQ_VHOST;
const port = process.env.RABBITMQ_PORT;

// const user = 'eric';
// const password = 'kuangsa183';
// const origin = 'develop.1024paas.com';
// const vhost = '/';
// const port = '5672';

// const user = 'guest';
// const password = 'guest';
// const origin = 'localhost';
// const vhost = '/';
// const port = '5672';

export class ConfigService {
  private readonly envConfig: { [key: string]: any } = null;

  private readonly logger = new Logger(ConfigService.name);

  constructor() {
    this.envConfig = {
      user,
      origin,
      password,
      vhost,
      port,
    };

    this.logger.verbose('配置文件', this.envConfig);
  }

  get(key: string) {
    return this.envConfig[key];
  }
}
