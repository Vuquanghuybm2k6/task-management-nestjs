// roadmaps/roadmaps.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource, TreeRepository } from 'typeorm';
import { Roadmap } from './entities/roadmap.entity';
import { Task } from '../tasks/entities/task.entity';
import { CreateRoadmapDto, CreateTaskDto } from './dto/create-roadmap.dto';

@Injectable()
export class RoadmapsService {
  constructor(private dataSource: DataSource) {}

  async create(createRoadmapDto: CreateRoadmapDto, userId?: string) {
    // Sử dụng Transaction để đảm bảo an toàn dữ liệu
    return await this.dataSource.transaction(async (manager) => {
      
      // Lưu Roadmap 
      const roadmap = manager.create(Roadmap, {
        title: createRoadmapDto.title,
        description: createRoadmapDto.description,
        isPublic: createRoadmapDto.isPublic,
        ...(userId ? { user: { id: userId } } : {}),
      });
      const savedRoadmap = await manager.save(roadmap);

      // Gọi hàm đệ quy để lưu các Task
      if (createRoadmapDto.tasks && createRoadmapDto.tasks.length > 0) {
        await this.saveTasksRecursive(
          manager, 
          createRoadmapDto.tasks, 
          savedRoadmap, 
          userId
        );
      }

      return savedRoadmap;
    });
  }

  // Hàm đệ quy để xử lý lưu Task n-cấp
  private async saveTasksRecursive(
    manager: any, 
    tasksDto: CreateTaskDto[], 
    roadmap: Roadmap, 
    userId?: string, 
    parent: Task | null = null
  ) {
    for (const dto of tasksDto) {
      // Tạo task mới và gán quan hệ
      const task = manager.create(Task, {
        title: dto.title,
        description: dto.description,
        roadmap: roadmap,
        ...(userId ? { user: { id: userId } } : {}),
        parent: parent, // Quan trọng: Gán cha để TypeORM tự điền Closure Table
      });

      const savedTask = await manager.save(task);

      // Nếu có subTasks, tiếp tục đào sâu xuống
      if (dto.subTasks && dto.subTasks.length > 0) {
        await this.saveTasksRecursive(manager, dto.subTasks, roadmap, userId, savedTask);
      }
    }
  }

  // Hàm lấy Roadmap theo cấu trúc cây
  async findOne(id: string) {
    const treeRepo = this.dataSource.getTreeRepository(Task);
    
    // Lấy toàn bộ cây task (Closure Table làm việc ở đây)
    const tasks = await treeRepo.findTrees({
      relations: ['roadmap'],
    });

    // Lọc lại những task thuộc Roadmap này
    const roadmapTasks = tasks.filter(t => t.roadmap?.id === id);

    return {
      roadmapId: id,
      tree: roadmapTasks,
    };
  }

  async findAll() {
    return this.dataSource.getRepository(Roadmap).find({
      relations: ['user', 'tasks'],
    });
  }

  async update(id: string, updateRoadmapDto: Partial<CreateRoadmapDto>) {
    const roadmapRepo = this.dataSource.getRepository(Roadmap);
    await roadmapRepo.update(id, updateRoadmapDto);
    return roadmapRepo.findOne({
      where: { id },
      relations: ['user', 'tasks'],
    });
  }

  async remove(id: string) {
    const roadmapRepo = this.dataSource.getRepository(Roadmap);
    const roadmap = await roadmapRepo.findOne({ where: { id } });
    if (!roadmap) {
      return null;
    }
    return roadmapRepo.remove(roadmap);
  }
}