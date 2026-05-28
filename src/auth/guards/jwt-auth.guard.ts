import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Khi bạn kế thừa AuthGuard('jwt'), NestJS sẽ:
  // 1. Tự tìm đến JwtStrategy để kiểm tra Token.
  // 2. Nếu Token hợp lệ, nó cho phép đi tiếp và gán dữ liệu vào req.user.
  // 3. Nếu Token sai/hết hạn, nó tự trả về lỗi 401 Unauthorized cho client.
}

