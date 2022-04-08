import { Test, TestingModule } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let catsController: CatsController;
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [CatsService],
    }).compile();
    catsController = app.get<CatsController>(CatsController);
  });
  describe('root', () => {
    it('should return Cat[]', () => {
      expect(catsController.findAll).toBe([]);
    });
  });
});
