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
import { GoogleUserDto } from './dto/googleUser.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) // Kết nối vào db để thao tác với bảng users
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
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
  async login(loginDto: LoginDto): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { email: loginDto.email } });
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const passwordMatched = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordMatched) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const { password, ...result } = user as any;
    if (result.profile) {
      delete result.profile.otpCode;
      delete result.profile.otpExpireAt;
    }
    return result;
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

    user.password = await bcrypt.hash(resetPasswordDto.password, 10);
    user.profile.otpCode = undefined;
    user.profile.otpExpireAt = undefined;
    user.tokenUser = crypto.randomBytes(16).toString('hex');

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

  async validateOAuthUser(googleUser: GoogleUserDto): Promise<{jwt:string}> {
    // 1. Kiểm tra user trong Postgres
    let user = await this.userRepository.findOne({ where: { email: googleUser.email } });

    if (!user) {
      // 2. Nếu chưa có thì tạo mới
      user = await this.userRepository.save({
        email: googleUser.email,
        name: googleUser.fullName || googleUser.email,
        profile: {
          avatar: googleUser.avatar,
          googleId: googleUser.googleId,
        } as any,
      } as any);
    }

    const existingUser = user as User;
    // 3. Tạo JWT Token
    const payload = { sub: existingUser.id, email: existingUser.email };
    return {
      jwt: this.jwtService.sign(payload),
    };
  }
}