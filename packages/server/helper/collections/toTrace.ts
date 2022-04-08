import * as chalk from 'chalk';

export default (data, count = 2) =>
  console.trace(chalk.yellow(JSON.stringify(data, null, count)));
