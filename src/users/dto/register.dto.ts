import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class RegisterDto{
  @ApiProperty({ example: 'user@example.com', description: 'Email của người dùng' })
  @IsNotEmpty({message: 'Email không được để trống'})
  @IsEmail({}, {message: 'Định dạng email không hợp lệ'})
  email!: string;

  @ApiProperty({example: 'Vũ Văn A', description: 'Tên của người dùng'})
  @IsNotEmpty({message: 'Tên không được để trống'})
  @IsString()
  name!: string;

  @ApiProperty({example: 'password123', description: 'Mật khẩu của người dùng'})
  @IsNotEmpty({message: 'Mật khẩu không được để trống'})
  @MinLength(6, {message: 'Mật khẩu phải có ít nhất 6 kí tự'})
  password!: string;

  @ApiProperty({example: '0123456789', description: 'Số điện thoại của người dùng', required: false})
  @IsOptional()
  @IsString()
  phone?: string; 

  @ApiProperty({example: 'https://example.com/avatar.jpg', description: 'URL avatar của người dùng', required: false})
  @IsOptional()
  @IsString() 
  avatar?: string;
  
  @ApiProperty({example: '123 Main St, City, Country', description: 'Địa chỉ của người dùng', required: false})
  @IsOptional()
  @IsString()
  address?: string;
}