import { Module } from '@nestjs/common';
import { RoadmapsService } from './roadmaps.service';
import { RoadmapController } from './roadmaps.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roadmap } from './entities/roadmap.entity';
import { Task } from '../tasks/entities/task.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Roadmap, Task])],
  controllers: [RoadmapController],
  providers: [RoadmapsService],
})
export class RoadmapModule {}
