import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';
import {ApiProperty} from '@nestjs/swagger';
export class CreateTaskDto {
  @ApiProperty({ example: 'Làm bài tập NestJS', description: 'Tiêu đề của công việc' })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Mô tả công việc', description: 'Mô tả chi tiết về công việc' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'pending', description: 'Trạng thái của công việc', enum: TaskStatus, required: false })
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Trạng thái phải là pending, in_progress hoặc done' })
  status?: TaskStatus;

  @ApiProperty({ example: 'user-uuid', description: 'ID của người dùng tạo công việc' })
  @IsNotEmpty({ message: 'UserId không được để trống' })
  @IsUUID('4', { message: 'UserId phải là UUID hợp lệ' })
  userId!: string;
}
