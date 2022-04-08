import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { CreateReplayfilesDto } from './dto/create-replayfiles.dto';
import { ReplayfilesService } from './replayfiles.service';
import { Replayfiles } from './schemas/replayfiles.schema';

@Controller()
export class ReplayFilesController {
  constructor(private readonly ReplayFilesService: ReplayfilesService) {}

  // @Post()
  @EventPattern({ cmd: 'replayfiles/createData' })
  async create(@Body() createCatDto: CreateReplayfilesDto) {
    console.log(createCatDto);
    await this.ReplayFilesService.create(createCatDto);
  }

  // @Get()
  @EventPattern({ cmd: 'replayfiles/findAll' })
  async findAll({ query }: { query: any }): Promise<Replayfiles[]> {
    return this.ReplayFilesService.findAll(query);
  }

  @Get(':dockerId')
  async findOne(@Param('dockerId') dockerId: string): Promise<Replayfiles> {
    // console.log(dockerId, ',,,,,,,,,,,,,,,');
    return this.ReplayFilesService.findOne(dockerId);
  }

  @EventPattern({ cmd: 'replayfiles/updateData' })
  update(
    data: CreateReplayfilesDto,
    // @Param('dockerId') dockerId: string,
    // @Body() updateCatDto: CreateReplaySourceDto,
  ) {
    return this.ReplayFilesService.update(data.path, data);
    // return `This action updates a #${dockerId} cat`;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.ReplayFilesService.delete(id);
  }
}
