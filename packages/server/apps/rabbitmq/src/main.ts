import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { RabbitmqModule } from './rabbitmq.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    RabbitmqModule,
    {
      transport: Transport.TCP,
      options: {
        // host: '0.0.0.0',
        port: 6000,
      },
    },
  );
  await app.listen();
  // console.log('miscroservices');
}
bootstrap();
