import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksQueryDto } from './dto/get-tasks-query.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger'

@ApiTags('tasks')
@ApiBearerAuth() // Thêm thông tin này để Swagger biết rằng các endpoint này cần token
@Controller('tasks')
@UseGuards(JwtAuthGuard) // Chỉ những người đã đăng nhập mới được quản lý tasks
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({summary: "Tạo mới một task"})
  @ApiResponse({ status: 201, description: 'Task được tạo thành công.' })
  async create(@Body() createTaskDto: CreateTaskDto) {
    return await this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({summary: "Lấy danh sách task với phân trang, lọc và sắp xếp"})
  @ApiResponse({ status: 200, description: 'Danh sách task được trả về thành công.' })
  async findAll(@Query() query: GetTasksQueryDto) {
    return await this.tasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({summary: "Lấy chi tiết một task"})
  @ApiResponse({ status: 200, description: 'Chi tiết task được trả về thành công.' })
  async findOne(@Param('id') id: string) {
    return await this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({summary: "Cập nhật thông tin một task"})
  @ApiResponse({ status: 200, description: 'Task được cập nhật thành công.' })
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return await this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({summary: "Xóa một task"})
  @ApiResponse({ status: 200, description: 'Task được xóa thành công.' })
  async remove(@Param('id') id: string) {
    return await this.tasksService.remove(id);
  }
}
