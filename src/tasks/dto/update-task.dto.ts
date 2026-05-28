import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';
import {ApiProperty} from '@nestjs/swagger';
export class UpdateTaskDto {
  @ApiProperty({example: 'Task mới', description: 'Tiêu đề của công việc', required: false})
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({example: 'Mô tả chi tiết về công việc', description: 'Mô tả của công việc', required: false})
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({example: 'pending', description: 'Trạng thái của công việc (pending, in_progress, done)', required: false})
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Trạng thái phải là pending, in_progress hoặc done' })
  status?: TaskStatus;

  @ApiProperty({example: 'd290f1ee-6c54-4b01-90e6-d701748f0851', description: 'ID của người dùng được giao công việc', required: false})
  @IsOptional()
  @IsUUID('4', { message: 'UserId phải là UUID hợp lệ' })
  userId?: string;
}
