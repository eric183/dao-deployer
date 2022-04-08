import { Module } from '@nestjs/common';

import { PassportModule } from '@nestjs/passport';
import { UsersModule } from './users.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ENTRY_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 9991,
        },
      },
    ]),
    UsersModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [],
})
export class AuthModule {}
