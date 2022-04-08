import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReplayFilesModule } from '../replayfiles/replayfiles.module';
import { ReplayfilesService } from '../replayfiles/replayfiles.service';
import { ReplaySourcesController } from './replaysources.controller';
import { ReplaySourcesService } from './replaysources.service';
// import { Cat, ReplaySourceschema } from './schemas/replaysources.schema';
import {
  ReplaySources,
  ReplaySourcesSchema,
} from './schemas/replaysources.schema';

// import { Cat, ReplaySourceschema } from './schemas/ReplaySources.schema';
// console.log('ReplaySourceschema:', ReplaySourceschema);
console.log('ReplaySources:', ReplaySources);
@Module({
  imports: [
    ReplayFilesModule,
    MongooseModule.forFeature([
      { name: ReplaySources.name, schema: ReplaySourcesSchema },
    ]),
  ],
  controllers: [ReplaySourcesController],
  providers: [ReplaySourcesService],
})
export class ReplaySourcesModule {}
