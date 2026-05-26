import { IsOptional, IsString, Matches } from 'class-validator';

export class GetTasksQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Matches(/^[1-9]\d*$/, { message: 'Page phải là số dương' })
  page?: string;

  @IsOptional()
  @Matches(/^[1-9]\d*$/, { message: 'Limit phải lớn hơn hoặc bằng 1' })
  limit?: string;
}
