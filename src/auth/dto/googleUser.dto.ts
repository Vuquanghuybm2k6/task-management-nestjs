import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from 'node_modules/@nestjs/swagger/dist/decorators/api-property.decorator';
export class GoogleUserDto {

  @ApiProperty({ description: 'Google ID của người dùng', example: 'google_id_example' })
  @IsNotEmpty({message: "Google ID không được để trống"})
  googleId!: string;

  @IsNotEmpty({message: "Email không được để trống"})
  @IsEmail({}, {message: "Định dạng email không hợp lệ"})
  @ApiProperty({ description: 'Email của người dùng', example: 'user@example.com' })
  email!: string;

  @IsNotEmpty({message: "Tên không được để trống"})
  @ApiProperty({ description: 'Tên đầy đủ của người dùng', example: 'John Doe' })
  fullName!: string;

  @ApiProperty({ description: 'URL avatar của người dùng', example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: 'Token truy cập của người dùng', example: 'access_token_example' })
  @IsOptional()
  @IsString()
  accessToken?: string;
}