import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto{
  @IsNotEmpty({message: "Email không được để trống"})
  @IsEmail({}, {message: "Định dạng email không hợp lệ"})
  email!: string;

  @IsNotEmpty({message: "Mật khẩu không được để trống"})
  @IsString()
  password!: string;
}