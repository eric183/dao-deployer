import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { Observable } from 'rxjs/internal/Observable';
import { ReplayfilesService } from '../replayfiles/replayfiles.service';
import { CreateReplaySourceDto } from './dto/create-replaysource.dto';
import { ReplaySourcesService } from './replaysources.service';
import { ReplaySources } from './schemas/replaysources.schema';

@Controller()
export class ReplaySourcesController {
  constructor(
    private readonly ReplaySourcesService: ReplaySourcesService,
    private readonly ReplayfilesService: ReplayfilesService,
  ) {}

  // @Post()
  @EventPattern({ cmd: 'replaysources/createData' })
  async create(@Body() createCatDto: CreateReplaySourceDto) {
    console.log(createCatDto);
    await this.ReplaySourcesService.create(createCatDto);
  }

  // @Get()
  @MessagePattern({ cmd: 'replaysources/findAll' })
  async findAll({ query }: { query: any }): Promise<any> {
    console.log('get all replay sources', query);
    const files = await this.ReplayfilesService.findAll(query);
    const source = await this.ReplaySourcesService.findAll(query);
    // console.log(source);
    // return source;
    return { source, files };
    // console.log(source, files);
    // return new Promise((resolve) => {
    //   resolve({ source, files });
    // });
  }

  @Get(':dockerId')
  async findOne(@Param('dockerId') dockerId: string): Promise<ReplaySources> {
    console.log(dockerId, ',,,,,,,,,,,,,,,');
    return this.ReplaySourcesService.findOne(dockerId);
  }

  @EventPattern({ cmd: 'replaysources/updateData' })
  update(
    data: CreateReplaySourceDto,
    // @Param('dockerId') dockerId: string,
    // @Body() updateCatDto: CreateReplaySourceDto,
  ) {
    console.log(data);
    return this.ReplaySourcesService.update(data.dockerId, data);
    // return `This action updates a #${dockerId} cat`;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.ReplaySourcesService.delete(id);
  }
}
