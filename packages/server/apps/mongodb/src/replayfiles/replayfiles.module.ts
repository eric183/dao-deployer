import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReplayFilesController } from './replayfiles.controller';
import { ReplayfilesService } from './replayfiles.service';
// import { Cat, ReplaySourceschema } from './schemas/replaysources.schema';
import { Replayfiles, ReplayfilesSchema } from './schemas/replayfiles.schema';

// import { Cat, ReplaySourceschema } from './schemas/ReplaySources.schema';
// console.log('ReplaySourceschema:', ReplaySourceschema);
console.log('ReplayFiles:', Replayfiles);
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Replayfiles.name, schema: ReplayfilesSchema },
    ]),
  ],
  controllers: [ReplayFilesController],
  providers: [ReplayfilesService],
  exports: [ReplayfilesService],
})
export class ReplayFilesModule {}
