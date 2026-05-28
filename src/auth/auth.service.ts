import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from '../users/dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokensService } from 'src/refresh_tokens/refresh_tokens.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) // Kết nối vào db để thao tác với bảng users
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly refreshTokensService: RefreshTokensService,
  ) { }

  // Hàm tạo Access Token (Hạn ngắn: 15 phút)
  generateAccessToken(user: User): string {
    const payload = { // định nghĩa dữ liệu mang theo, payload là phần tt muốn lưu trong token
      sub: user.id, // sub là để lưu id người dùng, sv nhìn lên và biết được ai đang gọi api đấy
      email: user.email 
    }; 
    return this.jwtService.sign(payload, { // hàm trộn payload với secret để tạo token
      secret: process.env.JWT_ACCESS_SECRET || 'accessSecret',
      expiresIn: '15m', // Bạn có thể chỉnh lại thời gian tùy ý
    });
  }

  // Hàm tạo Refresh Token (Hạn dài: 7 ngày)
  generateRefreshToken(user: User): string {
    const payload = { sub: user.id }; // Refresh token chỉ cần lưu userId (sub) cho gọn
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refreshSecret',
      expiresIn: '7d',
    });
  }

  async register(registerDto: RegisterDto): Promise<Partial<User>> {
    const existingUser = await this.userRepository.findOne({ where: { email: registerDto.email } });
    if (existingUser) {
      throw new BadRequestException('Email này đã được sử dụng, vui lòng chọn email khác!');
    }

    const user = this.userRepository.create({
      email: registerDto.email,
      name: registerDto.name,
      password: registerDto.password,
      profile: {
        phone: registerDto.phone,
        avatar: registerDto.avatar,
        address: registerDto.address,
      } as any,
    });
    const saved = await this.userRepository.save(user);
    const { password, ...result } = saved as any;
    if (result.profile) {
      delete result.profile.otpCode;
      delete result.profile.otpExpireAt;
    }
    return result;
  }

  async login(loginDto: LoginDto, req: any): Promise<any> {
    // 1. Tìm user và lấy luôn cả mật khẩu + profile
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['profile']
    });

    // 2. Kiểm tra sự tồn tại, có password, và so sánh mật khẩu hash
    if (!user || !user.password || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác'); // dừng mọi hoạt động phía sau
    }

    // 3. Tạo cặp đôi Token
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // 4. Thiết lập thời gian hết hạn cho DB (7 ngày)
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 7);

    // 5. Thu thập thông tin từ request
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const deviceInfo = this.extractDeviceInfo(userAgent);

    // 6. Lưu Refresh Token vào database
    await this.refreshTokensService.save({
      token: refreshToken, // Dùng biến đã tạo ở bước 3
      userId: user.id,
      expiresAt: expireAt,
      ipAddress: ipAddress,
      userAgent: userAgent,
      deviceInfo: deviceInfo,
    });

    // 7. Trả về cho Client (Ẩn mật khẩu để bảo mật)
    const { password, ...userResult } = user;
    return {
      message: 'Đăng nhập thành công',
      user: userResult,
      accessToken,
      refreshToken,
    };
  }
  
  private extractDeviceInfo(userAgent: string): string {
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('Android')) return 'Android Device';
    if (userAgent.includes('Macintosh')) return 'MacBook/Mac';
    if (userAgent.includes('Windows')) return 'Windows PC';
    return 'Unknown Device';
  }


  // Tại src/auth/auth.service.ts

  async refreshAccessToken(refreshTokenStr: string, req: any): Promise<any> {
    // Kiểm tra Token có tồn tại trong Database không
    const savedToken = await this.refreshTokensService.findOneByToken(refreshTokenStr);

    // Nếu không tìm thấy hoặc Token đã bị thu hồi (isRevoked)
    if (!savedToken || savedToken.isRevoked) {
      // Nếu bị hack hoặc dùng lại token cũ, ta thu hồi toàn bộ phiên đăng nhập của user này cho an toàn
      if (savedToken) {
        await this.refreshTokensService.revokeAllUserTokens(savedToken.userId);
      }
      throw new UnauthorizedException('Token không hợp lệ hoặc đã bị thu hồi!');
    }

    // Kiểm tra Token đã hết hạn chưa (Expired At)
    if (new Date() > savedToken.expiresAt) {
      throw new UnauthorizedException('Refresh Token đã hết hạn, vui lòng đăng nhập lại!');
    }

    // Lấy thông tin User từ token đã lưu
    const user = savedToken.user;

    // XOAY VÒNG TOKEN (ROTATION):
    // - Hủy token cũ ngay lập tức
    await this.refreshTokensService.update(savedToken.id, { isRevoked: true });

    // - Tạo bộ token mới (Access Token & Refresh Token mới)
    const accessToken = this.generateAccessToken(user);
    const newRefreshTokenStr = this.generateRefreshToken(user);

    // Lưu Refresh Token mới vào Database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokensService.save({
      token: newRefreshTokenStr,
      userId: user.id,
      expiresAt: expiresAt,
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      deviceInfo: this.extractDeviceInfo(req.headers['user-agent'] || ''),
    });

    // Trả về bộ token mới cho Client
    return {
      accessToken,
      refreshToken: newRefreshTokenStr,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const token = await this.refreshTokensService.findOneByToken(refreshToken);
    if (token) {
      // Đổi trạng thái thành đã thu hồi
      await this.refreshTokensService.update(token.id, { isRevoked: true });
    }
  }

  async handleOAuthLogin(user: User, req: any): Promise<any> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 7);

    await this.refreshTokensService.save({
      token: refreshToken,
      userId: user.id,
      expiresAt: expireAt,
      ipAddress: req.ip || 'oauth',
      userAgent: req.headers['user-agent'] || 'google-oauth',
      deviceInfo: this.extractDeviceInfo(req.headers['user-agent'] || ''),
    });

    const { password, ...userResult } = user as User;
    if (userResult.profile) {
      delete userResult.profile.otpCode;
      delete userResult.profile.otpExpireAt;
    }

    return {
      message: 'Đăng nhập Google thành công!',
      user: userResult,
      accessToken,
      refreshToken,
    };
  }

 async validateOAuthUser(details: { googleId: string; email: string; name: string }) {
  // Tìm bằng googleId 
  let user = await this.userRepository.findOne({ where: { googleId: details.googleId } });

  if (!user) {
    user = await this.userRepository.findOne({ where: { email: details.email } });
  }

  if (user) {
    
    if (!user.googleId) {
      user.googleId = details.googleId;
      await this.userRepository.save(user);
    }
    return user;
  }

  const newUser = this.userRepository.create({
    googleId: details.googleId,
    email: details.email,
    name: details.name
  } as any);

  return await this.userRepository.save(newUser);
}

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email: forgotPasswordDto.email } });
    if (!user) {
      throw new NotFoundException('Email không tồn tại trong hệ thống');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000);
    if (!user.profile) {
      user.profile = {} as any;
    }
    const profile = user.profile!;
    profile.otpCode = otpCode;
    profile.otpExpireAt = otpExpireAt;
    await this.userRepository.save(user);

    await this.sendOtpEmail(user, otpCode);
    return { message: 'Mã OTP đã được gửi tới email của bạn. Nó hợp lệ trong 10 phút.' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email: verifyOtpDto.email } });
    if (!user || !user.profile || !user.profile.otpCode || !user.profile.otpExpireAt) {
      throw new BadRequestException('OTP không hợp lệ');
    }

    if (user.profile.otpCode !== verifyOtpDto.otpCode) {
      throw new BadRequestException('OTP không đúng');
    }

    if (user.profile.otpExpireAt < new Date()) {
      throw new BadRequestException('OTP đã hết hạn');
    }

    return { message: 'OTP hợp lệ' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email: resetPasswordDto.email } });
    if (!user || !user.profile || !user.profile.otpCode || !user.profile.otpExpireAt) {
      throw new BadRequestException('Yêu cầu đặt lại mật khẩu không hợp lệ');
    }

    if (user.profile.otpCode !== resetPasswordDto.otpCode) {
      throw new BadRequestException('OTP không đúng');
    }

    if (user.profile.otpExpireAt < new Date()) {
      throw new BadRequestException('OTP đã hết hạn');
    }

    // 1. Mã hóa mật khẩu mới
    user.password = await bcrypt.hash(resetPasswordDto.password, 10);

    // 2. Dọn dẹp OTP
    user.profile.otpCode = undefined;
    user.profile.otpExpireAt = undefined;

    // 3. QUAN TRỌNG: Đuổi tất cả các thiết bị đang đăng nhập ra ngoài
    await this.refreshTokensService.revokeAllUserTokens(user.id);

    await this.userRepository.save(user);
    return { message: 'Mật khẩu đã được cập nhật thành công' };
  }

  private async sendOtpEmail(user: User, otpCode: string): Promise<void> {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = Number(this.configService.get<string>('MAIL_PORT') || 587);
    const secure = this.configService.get<string>('MAIL_SECURE') === 'true';
    const mailUser = this.configService.get<string>('MAIL_USER');
    const mailPass = this.configService.get<string>('MAIL_PASS');
    const from = this.configService.get<string>('MAIL_FROM') || 'vuquanghuybm2k6@gmail.com';

    if (!host || !mailUser || !mailPass) {
      console.log(`OTP gửi tới ${user.email}: ${otpCode}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user: mailUser, pass: mailPass },
    });

    try {
      await transporter.sendMail({
        from,
        to: user.email,
        subject: 'Mã OTP đặt lại mật khẩu',
        text: `Mã OTP của bạn là ${otpCode}. Nó có hiệu lực trong 10 phút.`,
        html: `<p>Xin chào ${user.name},</p><p>Mã OTP của bạn là <strong>${otpCode}</strong>.</p><p>Thời hạn: 10 phút.</p>`,
      });
    } catch (error) {
      console.error('Lỗi gửi email OTP:', error);
      throw new InternalServerErrorException('Không gửi được email OTP, vui lòng thử lại sau');
    }
  }

}