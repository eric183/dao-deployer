import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReplaySourceDto } from './dto/create-replaysource.dto';
import {
  ReplaySources,
  ReplaySourcesDocument,
} from './schemas/replaysources.schema';

@Injectable()
export class ReplaySourcesService {
  constructor(
    @InjectModel(ReplaySources.name)
    private readonly replaySourcesModel: Model<ReplaySourcesDocument>,
  ) {}

  async create(
    createReplaySourceDto: CreateReplaySourceDto,
  ): Promise<ReplaySources> {
    const createReplaySource = await this.replaySourcesModel.create(
      createReplaySourceDto,
    );
    return createReplaySource;
  }

  async findAll(query): Promise<ReplaySources[]> {
    return this.replaySourcesModel.find(query).exec();
  }

  async findOne(dockerId: string): Promise<ReplaySources> {
    return this.replaySourcesModel.findOne({ dockerId: dockerId }).exec();
  }

  async update(
    dockerId: string,
    updateReplaySourceDto: CreateReplaySourceDto,
  ): Promise<ReplaySources> {
    const updatedReplaySource = await this.replaySourcesModel.findOneAndUpdate(
      { dockerId: dockerId },
      {
        $set: updateReplaySourceDto,
      },
      {
        upsert: true,
        returnNewDocument: true,
      },
    );
    // .findByIdAndUpdate(
    //   { dockerId: dockerId },
    //   { $set: updateReplaySourceDto },
    //   { new: true },
    // )
    // .exec();
    return updatedReplaySource;
  }

  async delete(id: string) {
    const deletedCat = await this.replaySourcesModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
}
