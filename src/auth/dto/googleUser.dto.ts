import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class GoogleUserDto {
  @IsNotEmpty({message: "Google ID không được để trống"})
  googleId!: string;

  @IsNotEmpty({message: "Email không được để trống"})
  @IsEmail({}, {message: "Định dạng email không hợp lệ"})
  email!: string;

  @IsNotEmpty({message: "Tên không được để trống"})
  fullName!: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  accessToken?: string;
}