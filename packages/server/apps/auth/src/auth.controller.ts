import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import toJSON from 'helper/collections/toJSON';
import toTrace from 'helper/collections/toTrace';

import { RolesGuard } from './auth.guard';
import { UsersService } from './users.service';

@Controller()
export class AuthController {
  @Inject(UsersService)
  usersService: UsersService;

  @UseGuards(RolesGuard)
  @MessagePattern('auth/login')
  async login(data) {
    const user = this.usersService.findOne(data);

    // console.log('查询user', userInfo);
    return user ? user : this.usersService.create(user);
  }

  @EventPattern('user/clean')
  async userClean(data) {
    this.usersService.removeAll();
  }

  @MessagePattern('user/findOne')
  async userFindOne(uuid) {
    return this.usersService.findOne(uuid);
  }

  @MessagePattern('user/remove')
  async userRemove(uuid) {
    return this.usersService.remove(uuid);
  }
}
