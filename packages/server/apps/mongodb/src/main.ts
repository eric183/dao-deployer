// async function bootstrap() {
//   const app = await NestFactory.create(MongodbModule);
//   await app.listen(3000);
// }
// bootstrap();

import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
// import { WsAdapter } from '@nestjs/platform-ws';
import { MongodbModule } from './mongodb.module';
async function bootstrap() {
  // const app = await NestFactory.create(MongodbModule);
  // await app.listen(3080);
  // console.log(`Application is running on: ${await app.getUrl()}`);
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   MongodbModule,
  //   {
  //     transport: Transport.TCP,
  //   },
  // );
  // app.listen();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MongodbModule,
    {
      transport: Transport.TCP,
      options: {
        // host: '0.0.0.0',
        port: 17205,
      },
    },
  );
  await app.listen();
  // app.useWebSocketAdapter(new WsAdapter(app));
}
bootstrap();
