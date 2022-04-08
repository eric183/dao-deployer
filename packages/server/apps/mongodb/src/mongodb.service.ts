import { Injectable } from '@nestjs/common';

@Injectable()
export class MongodbService {
  getHello(): string {
    return 'Hello World!';
  }
}
