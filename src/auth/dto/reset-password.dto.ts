import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  email!: string;

  @ApiProperty({ description: 'Mã OTP', example: '123456' })
  @IsNotEmpty({ message: 'OTP không được để trống' })
  @IsString()
  @Length(6, 6, { message: 'OTP phải có 6 chữ số' })
  otpCode!: string;

  @ApiProperty({ description: 'Mật khẩu mới của người dùng', example: 'newpassword123' })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;
}
