import { Injectable } from '@nestjs/common';
import { findIndex } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private users = [];

  async findOne(userInfo): Promise<User | undefined> {
    // console.log(this.users);
    // const user = this.users.find((u) => u.uuid === userInfo.uuid);
    // return user ? user : this.create(userInfo);

    return this.users.find((u) => u.uuid === userInfo.uuid);
  }

  async create(userInfo): Promise<User | boolean> {
    // const user = {
    //   ...userInfo,
    //   uuid: uuidv4(),
    // };
    const user = userInfo;

    this.users.push(user);
    console.log('用户信息新建中~');
    return user;
  }

  async remove(uuid): Promise<boolean> {
    this.users = [];
    this.users.splice(findIndex(this.users, { uuid }), 1);
    return true;
  }

  async removeAll(): Promise<boolean> {
    this.users = [];
    return true;
  }
}

// {
//   userId: 1,
//   username: 'a',
//   password: 'changeme',
// },
// {
//   userId: 2,
//   username: 'maria',
//   password: 'guess',
// },
