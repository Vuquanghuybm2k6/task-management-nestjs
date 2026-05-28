import {IsOptional,IsString,IsUUID,IsPhoneNumber,IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({ description: 'ID của hồ sơ', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  id!: string;

  @ApiProperty({ description: 'Số điện thoại', example: '+84123456789' }) 
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ description: 'URL ảnh đại diện', example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiProperty({ description: 'Địa chỉ', example: '123 Đường ABC, Quận XYZ, TP.HCM' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'ID Google (nếu đăng nhập bằng Google)', example: 'google-1234567890' })
  @IsOptional()
  @IsString()
  googleId?: string;

  @ApiProperty({ description: 'ID Facebook (nếu đăng nhập bằng Facebook)', example: 'facebook-1234567890' })
  @IsUUID()
  userId!: string;
}