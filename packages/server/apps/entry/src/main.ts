import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './entry.module';

const CLIENT_PATH = join(process.cwd(), '..', 'client');
const STATIC_PATH = join(process.cwd(), '..', 'client/dist');
const STATIC_INDEX = join(process.cwd(), '..', 'client/dist');

// const STATIC_INDEX = join(process.cwd(), '..', 'client/src/public');
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      // host: '0.0.0.0',
      port: 9991,
    },
  });
  app.enableCors();
  app.useStaticAssets(STATIC_PATH, {
    prefix: '/dist',
  });

  app.useStaticAssets(join(STATIC_PATH, '/assets'), {
    prefix: '/assets',
  });

  // app.useStaticAssets(STATIC_INDEX);

  app.useStaticAssets(STATIC_INDEX, {
    prefix: '/ide',
  });

  // app.useStaticAssets(join(CLIENT_PATH, '.storybook/dist'), {
  //   prefix: '/storybook',
  // });

  app.useStaticAssets(join(CLIENT_PATH, '/dist/docs'), {
    prefix: '/tsdoc',
  });
  // app.useStaticAssets(STATIC_INDEX);

  await app.startAllMicroservices();
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);

  Logger.log('MAIN IS RUNNING');
}
bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { RedisIoAdapter } from './adapters/redis-io.adapter';
// import { AppModule } from './app.module';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { join } from 'path';

// // import { WsAdapter } from '@nestjs/platform-ws';

// async function bootstrap() {
//   const app = await NestFactory.create<NestExpressApplication>(AppModule);

//   app.enableCors();
//   console.log('........', __dirname);
//   // console.log('........', join(__dirname);

//   // app.useStaticAssets(join(__dirname, '../../../src', '/client/PaaS/dist/'), {
//   //   prefix: '/dist',
//   // });
//   // app.useStaticAssets(join(__dirname, '../../src', '/client/PaaS/public/'));

//   await app.listen(3005);
//   console.log(`Application is running on: ${await app.getUrl()}`);

//   // ptyProcess.write('ls\r');
// }
// bootstrap();
