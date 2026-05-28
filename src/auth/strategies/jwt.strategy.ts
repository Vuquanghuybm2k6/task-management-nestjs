import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Lấy token từ header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // tìm token trong header Authorization
      ignoreExpiration: false, // không bỏ qua việc kiểm tra hết hạn của token
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'accessSecret', // secret key để giải mã token, phải trùng với secret khi tạo token
    });
  }

  // Nếu token hợp lệ, hàm này sẽ trả về dữ liệu cho req.user
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email };
  }
}