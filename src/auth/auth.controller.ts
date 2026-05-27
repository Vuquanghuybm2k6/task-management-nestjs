import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common'; // Các decorator này được sử dụng để định nghĩa các route và xử lý yêu cầu HTTP trong NestJS. Chúng giúp xác định phương thức HTTP (GET, POST, v.v.) và cách xử lý dữ liệu từ yêu cầu.
import { AuthService } from './auth.service';
import { RegisterDto } from 'src/users/dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController{
  constructor(private readonly authService: AuthService){}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto){
    return await this.authService.forgotPassword(forgotPasswordDto);
  }
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto){
    return await this.authService.verifyOtp(verifyOtpDto);
  }
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto){
    return await this.authService.resetPassword(resetPasswordDto);
  }
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    // Dữ liệu từ Google Strategy sẽ nằm trong req.user
    const result = await this.authService.validateOAuthUser(req.user);
    
    // Bạn có thể tạo JWT ở đây và gửi về cho Client hoặc Redirect
    res.redirect(`http://myfrontend.com?token=${result.jwt}`);
  }
}