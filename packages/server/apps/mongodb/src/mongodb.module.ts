import { Module } from '@nestjs/common';
import { MongodbService } from './mongodb.service';
import { MongooseModule } from '@nestjs/mongoose';
// import { CatsModule } from './cats/cats.module';
import { ReplaySourcesModule } from './replaysources/replaysources.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReplayFilesModule } from './replayfiles/replayfiles.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ENTRY_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 9991,
          // port: 3001,
        },
      },
    ]),
    MongooseModule.forRoot('mongodb://localhost:27017/daopaas'),
    // CatsModule,
    ReplayFilesModule,
    ReplaySourcesModule,
  ],
  controllers: [],
  providers: [MongodbService],
})
export class MongodbModule {}
