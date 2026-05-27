import {IsOptional,IsString,IsUUID,IsPhoneNumber,IsUrl } from 'class-validator';

export class ProfileResponseDto {
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsUUID()
  userId!: string;
}