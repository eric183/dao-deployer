import * as dotenv from 'dotenv';
import * as path from 'path';
import * as chalk from 'chalk';

dotenv.config({
  path: path.resolve(process.cwd(), '../../', '.env.private'),
});

export default () => {
  if (process.env.NODE_ENV === 'production') {
    return 'IDEServer';
  }

  if (process.env.NODE_ENV !== 'production' && !process.env.QUEUE) {
    throw chalk.red('请运行 yarn env:dev 设置队列名~~');
    // process.env.NODE_ENV === 'production' ? 'IDEServer' : process.env.QUEUE;
  }

  return process.env.QUEUE;
};
