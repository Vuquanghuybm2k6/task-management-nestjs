import { IsOptional, IsString, Matches } from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
export class GetTasksQueryDto {
  @ApiProperty({example: 'task name', description: 'Từ khóa tìm kiếm theo tên công việc', required: false})
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({example: '1', description: 'Số trang', required: false})
  @IsOptional()
  @Matches(/^[1-9]\d*$/, { message: 'Page phải là số dương' })
  page?: string;

  @ApiProperty({example: '10', description: 'Số lượng công việc trên mỗi trang', required: false})
  @IsOptional()
  @Matches(/^[1-9]\d*$/, { message: 'Limit phải lớn hơn hoặc bằng 1' })
  limit?: string;
}
