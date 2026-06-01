import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer'; // Cần để validate mảng lồng nhau
import { TaskStatus } from '../entities/task.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Lộ trình NestJS', description: 'Tiêu đề của công việc' })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Học về Module và Provider', description: 'Mô tả chi tiết' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'pending', enum: TaskStatus, required: false })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({ example: 'd290f1ee-6c54-4b01-90e6-d701748f0851', description: 'ID của người dùng được giao công việc' })
  @IsString()
  userId!: string;

  // QUAN TRỌNG: Thêm subTasks để hỗ trợ Closure Table
  @ApiProperty({ type: [CreateTaskDto], description: 'Danh sách công việc con', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true }) // Kiểm tra validate từng phần tử trong mảng
  @Type(() => CreateTaskDto) // Chỉ định kiểu để class-transformer chuyển đổi đúng
  subTasks?: CreateTaskDto[];
}