import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Trạng thái phải là pending, in_progress hoặc done' })
  status?: TaskStatus;

  @IsOptional()
  @IsUUID('4', { message: 'UserId phải là UUID hợp lệ' })
  userId?: string;
}
