import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
export class RegisterDto{
  @IsNotEmpty({message: 'Email không được để trống'})
  @IsEmail({}, {message: 'Định dạng email không hợp lệ'})
  email!: string;

  @IsNotEmpty({message: 'Tên không được để trống'})
  @IsString()
  name!: string;

  @IsNotEmpty({message: 'Mật khẩu không được để trống'})
  @MinLength(6, {message: 'Mật khẩu phải có ít nhất 6 kí tự'})
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string; 

  @IsOptional()
  @IsString()
  avatar?: string;
  
  @IsOptional()
  @IsString()
  address?: string;
}