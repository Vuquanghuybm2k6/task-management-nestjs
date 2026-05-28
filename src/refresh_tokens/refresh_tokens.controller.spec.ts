import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokensController } from './refresh_tokens.controller';
import { RefreshTokensService } from './refresh_tokens.service';

describe('RefreshTokensController', () => {
  let controller: RefreshTokensController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefreshTokensController],
      providers: [RefreshTokensService],
    }).compile();

    controller = module.get<RefreshTokensController>(RefreshTokensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
