import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users') // Nhóm các API liên quan đến User lại
@Controller('users')
export class UsersController{
  constructor(private readonly usersService: UsersService){}


  @Post('register')   
  @ApiOperation({ summary: 'Đăng ký người dùng mới' })
  @ApiResponse({ status: 201, description: 'Người dùng được tạo thành công.' })
  async register(@Body() registerDto: RegisterDto){
    return await this.usersService.Register(registerDto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin người dùng' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.findById(id);
  }
}