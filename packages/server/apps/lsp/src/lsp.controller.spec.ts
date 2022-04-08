import { Test, TestingModule } from '@nestjs/testing';
import { LspController } from './lsp.controller';
import { LspService } from './lsp.service';

describe('LspController', () => {
  let lspController: LspController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LspController],
      providers: [LspService],
    }).compile();

    lspController = app.get<LspController>(LspController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(lspController.getHello()).toBe('Hello World!');
    });
  });
});
