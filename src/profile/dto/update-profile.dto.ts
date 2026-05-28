import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateProfileDto {
  @ApiProperty({ description: 'Số điện thoại', example: '+84123456789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'URL ảnh đại diện', example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: 'Địa chỉ', example: '123 Đường ABC, Quận XYZ, TP.HCM' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'ID Google (nếu đăng nhập bằng Google)', example: 'google-1234567890' })
  @IsOptional()
  @IsString()
  otpCode?: string;

  @ApiProperty({ description: 'Thời gian hết hạn OTP', example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsString()
  otpExpireAt?: string;

  @ApiProperty({ description: 'ID Facebook (nếu đăng nhập bằng Facebook)', example: 'facebook-1234567890' })
  @IsOptional()
  @IsString()
  googleId?: string;
}
