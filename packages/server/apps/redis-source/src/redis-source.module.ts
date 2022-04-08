import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisSourceController } from './redis-source.controller';
import { RedisSourceService } from './redis-source.service';
import * as dotenv from 'dotenv';
import * as path from 'path';

// console.log(RedisConfig);

dotenv.config({ path: path.resolve(process.cwd(), '../../', '.env') });

const RedisConfig = {
  host: process.env.SOCKET_INSTANCE_REDIS_HOST,
  port: process.env.SOCKET_INSTANCE_REDIS_PORT,
  password: process.env.SOCKET_INSTANCE_REDIS_PASSWORD,
  database: process.env.SOCKET_INSTANCE_REDIS_DATABASE,
};

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
    ClientsModule.register([
      {
        name: 'REDIS_SERVICE',
        transport: Transport.REDIS,
        options: {
          db: RedisConfig.database,
          // url: 'redis://localhost:6379',
          url: `redis://${RedisConfig.password}@${RedisConfig.host}:${RedisConfig.port}/${RedisConfig.database}`,
        },
      },
    ]),
  ],
  controllers: [RedisSourceController],
  providers: [RedisSourceService],
})
export class RedisSourceModule {}
