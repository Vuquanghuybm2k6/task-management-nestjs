import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Trạng thái phải là pending, in_progress hoặc done' })
  status?: TaskStatus;

  @IsNotEmpty({ message: 'UserId không được để trống' })
  @IsUUID('4', { message: 'UserId phải là UUID hợp lệ' })
  userId!: string;
}
