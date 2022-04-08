import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  Inject,
} from '@nestjs/common';

import { UsersService } from './users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  @Inject(UsersService)
  usersService: UsersService;

  canActivate(context: ExecutionContext) {
    this.usersService.findOne(context.getArgs()[0]);
    return true;
  }
}
