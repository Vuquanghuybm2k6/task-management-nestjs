import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { RegisterDto } from "./dto/register.dto";
import { NotFoundException } from "@nestjs/common/exceptions";
@Injectable()
export class UsersService{
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ){}
  async Register(registerDto: RegisterDto) {
    const userExist = await this.userRepository.findOne({where: {email: registerDto.email}})
    if(userExist){
      throw new BadRequestException('Email này đã được sử dụng, vui lòng chọn email khác!')
    }
    else{
      const newUser = this.userRepository.create(registerDto)
      const user = await this.userRepository.save(newUser)
      const {password, otpCode, otpExpireAt, ...result} = user
      return result;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Người dùng không tìm thấy');
    }
    const { password, otpCode, otpExpireAt, ...result } = user;
    return result;
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}