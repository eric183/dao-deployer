import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import getQueue from 'helper/collections/getQueue';
import toTrace from 'helper/collections/toTrace';
import { DockerInfoType, PlaygroundInfoType } from 'types';

// toTrace(getQueue());
// crypto
@Injectable()
export class RabbitmqService {
  activeDockerId: string;
  consumerPlaygroundId: string;

  dockerInfos: Map<string, DockerInfoType> = new Map([]);
  playgroundInfos: Map<string, Partial<PlaygroundInfoType>> = new Map([]);

  private readonly logger = new Logger(RabbitmqService.name);

  @Inject('ENTRY_SERVICE')
  client: ClientProxy;
  constructor(
    private readonly amqpConnection: AmqpConnection, // @Inject('ENTRY_SERVICE') private client: ClientProxy,
  ) {}

  /**
   *
   * 只有 active、 stop、 run、 shell 的队列不会有 ReplyMessageId.
   *
   */

  @RabbitSubscribe({
    exchange: 'paas',
    queue: getQueue(),
    // allowNonJsonMessages: true,
    routingKey: `${getQueue()}.#`,
    queueOptions: {
      //   exclusive: false,
      autoDelete: true,
      messageTtl: 3000,
      deadLetterExchange: 'paas-alert',
    },
    errorHandler: (channel, msg, error: Error) => {
      // console.log(error, 'errorrrrrrrrrrrrrrrrrrrrrrrr');
      channel.reject(msg, false);
    },
  })
  public async getInfo(msg, channel) {
    const playgroundId: string = channel.fields.routingKey.split('.')[2];
    // toTrace(`******Response****, ${playgroundId}, ******Response****`);
    // this.logger.log(`${JSON.stringify(msg)}`);
    // this.logger.log({ ...msg });
    this.logger.log({ ...msg });
    this.logger.debug(
      // `******Response****, ${playgroundId}, ******Response****`,
      // `******Response****, ${channel.fields.routingKey}, ******Response****`,
      `******Response****, ${channel.properties.type}, ******Response****`,
      // `******Response****, ${JSON.stringify(channel)}, ******Response****`,
    );

    // console.log(channel.properties.type, 'zzzzzzzzzzzzplaygroundInfo');
    // console.log(channel);

    let playgroundInfo = this.playgroundInfos.get(playgroundId);
    playgroundInfo = playgroundInfo
      ? {
          ...playgroundInfo,
          playgroundId,
        }
      : { playgroundId };
    this.playgroundInfos.set(playgroundId, playgroundInfo);

    // this.payload.playgroundInfo = { playgroundId };
    switch (channel.properties.type) {
      case 'playgroundInfo':
        // eslint-disable-next-line no-case-declarations
        const resPlaygroundInfo = {
          ...playgroundInfo,
          ...msg,
        };

        this.playgroundInfos.set(
          playgroundInfo.playgroundId,
          resPlaygroundInfo,
        );

        this.client.emit('getEnvInfo', {
          playgroundInfo: resPlaygroundInfo,
        });

        break;
      case 'dockerInfo':
        console.log('获取文件树 --- GOT');
        playgroundInfo.activeDockerId = msg.dockerId;
        this.dockerInfos.set(msg.dockerId, msg);
        // this.client.emit('getEnvInfo', msg);
        this.client.emit('getEnvInfo', {
          playgroundInfo,
          dockerInfo: msg,
        });

        break;
      case 'runStatus':
        this.client.emit('getDockerStatus', {
          status: msg.status,
          playgroundId,
        });
        break;
      case 'fileContent':
        // toTrace(msg);
        this.client.emit('fileContentFromRedis', { ...msg, playgroundId });
        break;
      case 'fileTree':
        this.client.emit('updateFileTree', { ...msg, playgroundId });
        break;
      case 'terminal':
        // console.log('terminal', '.dasfjlkdasjkf;lasdjfkl;sadjf;lkasjl;');
        this.client.emit('getTerminalContent', { ...msg, playgroundId });
        break;
      case 'console':
        console.log('console', msg);

        this.client.emit('getConsoleContent', { ...msg, playgroundId });
        break;
      case 'nixStatus':
        this.client.emit('getNixStatus', { ...msg, playgroundId });
        break;
      case 'config':
        this.client.emit('getComponentsConfig', { ...msg, playgroundId });
        break;
      case 'active':
        // this.logger.log('ActiveType', msg);

        // console.log(channel.properties.type, 'ActiveType');
        // console.log(msg);
        if (!msg.success) {
          this.client.emit('errorHandler', { ...msg, playgroundId });
        }
        break;
      default:
        break;
    }
  }

  public async publish({ exchange, routingKey, message, options }) {
    // if (options.type === 'dockerInfo') {
    this.logger.debug(
      `******Request****, [${options.type}]: ${routingKey}, ******request****`,
    );

    // toTrace(
    //   `******Request****, [${options.type}]: ${routingKey}, ******request****`,
    // );
    // }
    return this.amqpConnection.publish(exchange, routingKey, message, options);
  }
}
