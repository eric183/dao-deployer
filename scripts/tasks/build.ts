import path from 'path';
// import webpack from 'webpack';
// import webpackConfig from '../../packages/client/config/webpack.prod.config';
// import chalk from 'chalk';
// import ProgressBar from 'progress';
import rimraf from 'rimraf';
import fs from 'fs-extra';
// import pm2 from 'pm2';

const ENV = '';
const argv = '';
// const WEBPACK_COFNIG = webpackConfig(ENV, argv) as webpack.Configuration;
const pathResolve = path.resolve(__dirname, '../../', 'packages/client');
// const spinner = ora(`${chalk.red('Building~')}`).start();
// const bar = new ProgressBar(':bar', { total: 10 });
rimraf(path.join(pathResolve, 'dist'), {}, (err) => {
  // console.log();
  // webpack(
  //   {
  //     ...WEBPACK_COFNIG,
  //     plugins: [
  //       ...(WEBPACK_COFNIG.plugins as webpack.WebpackPluginInstance[]),
  //       new webpack.ProgressPlugin((percentage, message, ...args) => {
  //         // console.log(percentage);
  //         // spinner();
  //         // console.log(chalk.yellow(percentage));
  //       }),
  //     ],
  //   },
  //   (err, stats) => {
  //     console.log(stats);
  //     if (err || stats?.hasErrors()) {
  //       // [Handle errors here](#error-handling)
  //     }
  //     fs.copy(
  //       path.join(pathResolve, 'src/types/editor.d.ts'),
  //       path.join(pathResolve, 'dist/index.d.ts'),
  //     )
  //       .then(() => console.log('success!'))
  //       .catch((err) => console.error(err, __dirname));
  //   },
  // );
});
