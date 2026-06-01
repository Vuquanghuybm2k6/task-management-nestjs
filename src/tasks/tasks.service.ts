import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'; // Các decorator này được sử dụng để đánh dấu lớp là một provider có thể được inject vào các lớp khác trong NestJS.
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksQueryDto } from './dto/get-tasks-query.dto';
import { Task, TaskStatus } from './entities/task.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  private getTreeRepository(): TreeRepository<Task> {
    return this.taskRepository.manager.getTreeRepository(Task);
  }

  private async saveTaskRecursive(dto: CreateTaskDto, user: User, parent: Task | null = null): Promise<Task> {
    const task = this.taskRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status ?? TaskStatus.PENDING,
      user,
      parent: parent ?? undefined,
    });

    const savedTask = await this.taskRepository.save(task);

    if (dto.subTasks && dto.subTasks.length > 0) {
      for (const subTaskDto of dto.subTasks) {
        await this.saveTaskRecursive(subTaskDto, user, savedTask);
      }
    }

    return savedTask;
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const user = await this.userRepository.findOne({ where: { id: createTaskDto.userId } });
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    const rootTask = await this.saveTaskRecursive(createTaskDto, user);
    return await this.taskRepository.findOneOrFail({
      where: { id: rootTask.id },
      relations: ['user', 'user.profile', 'subTasks', 'subTasks.subTasks', 'subTasks.subTasks.subTasks'],
    });
  }

  async findAll(query: GetTasksQueryDto): Promise<{ data: Task[]; total: number; page: number; limit: number }> {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 3;
    const treeRepo = this.getTreeRepository();
    let tasks = await treeRepo.findTrees({ relations: ['user', 'user.profile'] });

    if (query.search) {
      const search = query.search.trim().toLowerCase();

      const filterTask = (task: Task): Task | null => {
        const children = (task.subTasks || [])
          .map(filterTask)
          .filter((child): child is Task => child !== null);

        const matched = task.title.toLowerCase().includes(search) || (task.description ?? '').toLowerCase().includes(search);
        if (matched || children.length > 0) {
          return { ...task, subTasks: children } as Task;
        }
        return null;
      };

      tasks = tasks.map(filterTask).filter((task): task is Task => task !== null);
    }

    const total = tasks.length;
    const pagedTasks = tasks.slice((page - 1) * limit, page * limit);

    return { data: pagedTasks, total, page, limit };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id }, relations: ['user', 'user.profile'] });
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }

    const treeRepo = this.getTreeRepository();
    const taskTree = await treeRepo.findDescendantsTree(task);

    return {
      ...taskTree,
      user: {
        id: task.user.id,
        email: task.user.email,
        name: task.user.name,
        phone: task.user.profile?.phone,
        avatar: task.user.profile?.avatar,
        address: task.user.profile?.address,
      } as any,
    };
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.preload({ id, ...updateTaskDto });
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }

    if (updateTaskDto.userId) {
      const user = await this.userRepository.findOne({ where: { id: updateTaskDto.userId } });
      if (!user) {
        throw new BadRequestException('Người dùng không tồn tại');
      }
      task.user = user;
    }

    return this.taskRepository.save(task);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.taskRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Task không tồn tại');
    }
    return { deleted: true };
  }
}
