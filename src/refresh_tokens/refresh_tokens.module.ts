import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh_token.entity'; // Bạn sửa lại đường dẫn entity cho đúng nhé
import { RefreshTokensService } from './refresh_tokens.service';
import { RefreshTokensController } from './refresh_tokens.controller';

@Module({
  imports: [
    // Đăng ký entity RefreshToken với TypeORM trong phạm vi module này
    TypeOrmModule.forFeature([RefreshToken]),
  ],
  providers: [RefreshTokensService],
  controllers: [RefreshTokensController], 
  // BẮT BUỘC phải exports để AuthModule sau này có thể import và dùng được RefreshTokensService
  exports: [RefreshTokensService], 
})
export class RefreshTokensModule {}