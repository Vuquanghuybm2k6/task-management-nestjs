import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'; // Các decorator này được sử dụng để đánh dấu lớp là một provider có thể được inject vào các lớp khác trong NestJS.
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const user = await this.userRepository.findOne({ where: { id: createTaskDto.userId } });
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    const task = this.taskRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description ?? null,
      status: createTaskDto.status ?? TaskStatus.PENDING, // nếu client không gửi status thì mặc định là PENDING
      user,
    });

    return this.taskRepository.save(task);
  }

  async findAll(query: GetTasksQueryDto): Promise<{ data: Task[]; total: number; page: number; limit: number }> {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 3;
    const offset = (page - 1) * limit;
    const qb = this.taskRepository
      .createQueryBuilder('task')
      .leftJoin('task.user', 'user')
      .leftJoin('user.profile', 'profile')
      .select([
        'task',
        'user.id',
        'user.email',
        'user.name',
        'profile.phone',
        'profile.avatar',
        'profile.address',
      ]);

    if (query.search) {
      const search = `%${query.search.trim()}%`;
      qb.andWhere('(task.title ILIKE :search OR task.description ILIKE :search)', { search });
    }

    const [data, total] = await qb.skip(offset).take(limit).getManyAndCount();
    const mappedData = data.map((task) => ({
      ...task,
      user: {
        id: task.user.id,
        email: task.user.email,
        name: task.user.name,
        phone: task.user.profile?.phone,
        avatar: task.user.profile?.avatar,
        address: task.user.profile?.address,
      } as any,
    }));

    return { data: mappedData, total, page, limit };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id }, relations: ['user', 'user.profile'] });
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }
    return {
      ...task,
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
