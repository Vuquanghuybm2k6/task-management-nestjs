import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto{
  @ApiProperty({ description: 'Email của người dùng', example: 'user@example.com' })
  @IsNotEmpty({message: "Email không được để trống"})
  @IsEmail({}, {message: "Định dạng email không hợp lệ"})
  email!: string;

  @ApiProperty({ description: 'Mật khẩu của người dùng', example: 'password123' })
  @IsNotEmpty({message: "Mật khẩu không được để trống"})
  @IsString()
  password!: string;
}