import { BadRequestException, Body, Controller, Get, Post, Req } from '@nestjs/common'; // Các decorator này được sử dụng để định nghĩa các route và xử lý yêu cầu HTTP trong NestJS. Chúng giúp xác định phương thức HTTP (GET, POST, v.v.) và cách xử lý dữ liệu từ yêu cầu.
import { AuthService } from './auth.service';
import { RegisterDto } from 'src/users/dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController{
  constructor(private readonly authService: AuthService){}

  @Post('register')
  @ApiOperation({summary:'Đăng ký người dùng mới'})
  @ApiResponse({status: 201, description: 'Người dùng được tạo thành công.'})
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({summary: 'Đăng nhập người dùng'})
  @ApiResponse({status: 200, description: 'Đăng nhập thành công, trả về access token và refresh token'})
  async login(@Body() loginDto: LoginDto, @Req() req:any) {
    return await this.authService.login(loginDto, req);
  }

  @Post('refresh')
  @ApiOperation({summary: 'Làm mới token truy cập'})
  @ApiResponse({status: 200, description: 'Token truy cập được làm mới thành công'})
  async refresh(
    @Body('refreshToken') refreshToken: string, 
    @Req() req: any
  ) {
    if (!refreshToken) { // nếu người dùng không gửi kèm R token thì return về lỗi
      throw new BadRequestException('Refresh Token là bắt buộc');
    }
    return this.authService.refreshAccessToken(refreshToken, req);
  }
  
  @Post('logout')
  @ApiOperation({summary: 'Đăng xuất người dùng'})
  @ApiResponse({status: 200, description: 'Đăng xuất thành công'})
  async logout(@Body('refreshToken') refreshToken: string) {
    await this.authService.logout(refreshToken);
    return { message: 'Đăng xuất thành công' };
  }

  @Post('forgot-password')
  @ApiOperation({summary: 'Yêu cầu đặt lại mật khẩu'})
  @ApiResponse({status: 200, description: 'Email yêu cầu đặt lại mật khẩu đã được gửi'})
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto){
    return await this.authService.forgotPassword(forgotPasswordDto);
  }
  @Post('verify-otp')
  @ApiOperation({summary: 'Xác minh OTP'})
  @ApiResponse({status: 200, description: 'OTP được xác minh thành công'})
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto){
    return await this.authService.verifyOtp(verifyOtpDto);
  }
  @Post('reset-password')
  @ApiOperation({summary: 'Đặt lại mật khẩu'})
  @ApiResponse({status: 200, description: 'Mật khẩu đã được đặt lại thành công'})
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto){
    return await this.authService.resetPassword(resetPasswordDto);
  }
}