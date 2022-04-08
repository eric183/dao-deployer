import { Module } from '@nestjs/common';
import {
  ClientProxyFactory,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { AssetsController } from './entry.assets.controller';
// import { RolesGuard } from '../../auth/src/auth.guard';
import { AppController } from './entry.controller';
import { AppGateway } from './entry.gateway';
import { AppService } from './entry.service';
import { ReplayService } from './providers/replay.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 7000,
        },
      },
      {
        name: 'MQ_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 6000,
        },
      },
      {
        name: 'REDIS_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 4002,
        },
      },
      {
        name: 'MONGODB_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 17205,
        },
      },
    ]),
  ],
  controllers: [AppController, AssetsController],
  providers: [AppService, AppGateway, ReplayService],
})
export class AppModule {}
