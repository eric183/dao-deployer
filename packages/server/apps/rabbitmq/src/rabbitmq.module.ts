import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '../config/config.service';
import { RabbitmqController } from './rabbitmq.controller';
import { RabbitmqService } from './rabbitmq.service';

const CONFIG_SERVICE = new ConfigService();

const user = CONFIG_SERVICE.get('user');
const origin = CONFIG_SERVICE.get('origin');
const password = CONFIG_SERVICE.get('password');
const vhost = CONFIG_SERVICE.get('vhost');
const port = CONFIG_SERVICE.get('port');

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
    RabbitMQModule.forRoot(RabbitMQModule, {
      // exchanges: [
      //   {
      //     name: 'paas',
      //     type: 'playgroundInfo',
      //   },
      // ],
      enableDirectReplyTo: false,
      uri: `amqp://${user}:${password}@${origin}:${port}${vhost}`,
      connectionManagerOptions: { heartbeatIntervalInSeconds: 5 },
      connectionInitOptions: {
        wait: true,
        reject: true,
        timeout: 3000,
      },
    }),
  ],
  controllers: [RabbitmqController],
  providers: [RabbitmqService],
})
export class RabbitmqModule {}
