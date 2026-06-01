// roadmaps/dto/create-roadmap.dto.ts

export class CreateTaskDto {
  title!: string;
  description?: string;
  subTasks?: CreateTaskDto[]; // Đệ quy ở đây
}

export class CreateRoadmapDto {
  title!: string;
  description?: string;
  isPublic!: boolean;
  tasks!: CreateTaskDto[]; // Danh sách các task cấp 1
}