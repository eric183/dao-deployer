import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { LspModule } from './lsp.module';
import { WsAdapter } from '@nestjs/platform-ws';
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    LspModule,
    {
      transport: Transport.TCP,
    },
  );
  app.useWebSocketAdapter(new WsAdapter(app));

  app.listen();
}
bootstrap();
