import { Controller, Get, Post,Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
@Controller('users')
export class UsersController{
  constructor(private readonly usersService: UsersService){}
  @Post('register')
  async register(@Body() registerDto: RegisterDto){
    return await this.usersService.Register(registerDto)
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findById(id);
  }
}