import { Test, TestingModule } from '@nestjs/testing';
import { RoadmapController } from './roadmaps.controller';
import { RoadmapService } from './roadmaps.service';

describe('RoadmapController', () => {
  let controller: RoadmapController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoadmapController],
      providers: [RoadmapService],
    }).compile();

    controller = module.get<RoadmapController>(RoadmapController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
