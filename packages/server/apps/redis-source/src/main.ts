import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RedisSourceModule } from './redis-source.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    RedisSourceModule,
    {
      transport: Transport.TCP,
      options: {
        // host: '0.0.0.0',
        port: 4002,
      },
    },
  );
  await app.listen();
  console.log('miscroservices');
}
bootstrap();
