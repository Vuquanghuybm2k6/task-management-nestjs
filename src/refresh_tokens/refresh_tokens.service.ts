import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh_token.entity';

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  // tìm kiếm một Token trong DB kèm theo thông tin User 
  async findOneByToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'], // Tải luôn thông tin User liên kết với token này
    });
  }

  // lưu một token mới vào Database
  async save(refreshToken: Partial<RefreshToken>): Promise<RefreshToken> {
    const newToken = this.refreshTokenRepository.create(refreshToken);
    return this.refreshTokenRepository.save(newToken);
  }

  // cập nhật trạng thái của Token (ví dụ: khi Revoke hoặc Rotate)
  async update(id: string, updateData: Partial<RefreshToken>): Promise<void> {
    await this.refreshTokenRepository.update(id, updateData);
  }

  // thu hồi tất cả token của một User (Dùng khi phát hiện hacker hoặc khi đổi mật khẩu)
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  // lấy danh sách thiết bị đang hoạt động
  async findActiveTokensByUserId(userId: string) {
    return this.refreshTokenRepository.find({
      where: { 
        userId, 
        isRevoked: false 
      },
      select: ['id', 'deviceInfo', 'ipAddress', 'userAgent', 'createdAt', 'expiresAt']
    });
  }

  // thu hồi một token cụ thể theo ID (và phải đúng chủ sở hữu)
  async revokeTokenById(id: string, userId: string) {
    return this.refreshTokenRepository.update(
      { id, userId }, 
      { isRevoked: true }
    );
  }


}