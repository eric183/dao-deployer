import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReplayfilesDto } from './dto/create-replayfiles.dto';
import { Replayfiles, ReplayfilesDocument } from './schemas/replayfiles.schema';

@Injectable()
export class ReplayfilesService {
  constructor(
    @InjectModel(Replayfiles.name)
    readonly ReplayfilesModel: Model<ReplayfilesDocument>,
  ) {}

  async create(
    createreplayfilesDto: CreateReplayfilesDto,
  ): Promise<Replayfiles> {
    const createreplayfiles = await this.ReplayfilesModel.create(
      createreplayfilesDto,
    );
    return createreplayfiles;
  }

  async findAll(query): Promise<Replayfiles[]> {
    return this.ReplayfilesModel.find(query).exec();
  }

  async findOne(dockerId: string): Promise<Replayfiles> {
    return this.ReplayfilesModel.findOne({ dockerId: dockerId }).exec();
  }

  async update(
    path: string,
    updatereplayfilesDto: CreateReplayfilesDto,
  ): Promise<Replayfiles> {
    const updatedreplayfiles = await this.ReplayfilesModel.findOneAndUpdate(
      { path: path },
      {
        $set: updatereplayfilesDto,
      },
      {
        upsert: true,
        returnNewDocument: true,
      },
    );
    // .findByIdAndUpdate(
    //   { dockerId: dockerId },
    //   { $set: updatereplayfilesDto },
    //   { new: true },
    // )
    // .exec();
    return updatedreplayfiles;
  }

  async delete(id: string) {
    const deletedCat = await this.ReplayfilesModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }
}
