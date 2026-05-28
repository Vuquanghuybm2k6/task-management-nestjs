import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ description: 'Email của người dùng', example: 'user@example.com' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  email!: string;

  @ApiProperty({ description: 'Mã OTP', example: '123456' })
  @IsNotEmpty({ message: 'OTP không được để trống' })
  @IsString()
  @Length(6, 6, { message: 'OTP phải có 6 chữ số' })
  otpCode!: string;
}
