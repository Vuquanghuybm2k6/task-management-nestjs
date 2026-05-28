import { Controller, Get, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { RefreshTokensService } from './refresh_tokens.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('refresh-tokens')
@Controller('refresh-tokens')
@UseGuards(JwtAuthGuard) // Chỉ những người đã đăng nhập mới được quản lý token
export class RefreshTokensController {
  constructor(private readonly refreshTokensService: RefreshTokensService) {}

  // Lấy danh sách các thiết bị đang đăng nhập 
  @Get('active-sessions')
  @ApiOperation({summary: 'Lấy danh sách các thiết bị đang đăng nhập'})
  @ApiResponse({status: 200, description: 'Trả về danh sách các thiết bị đang đăng nhập'})
  async getActiveSessions(@Req() req: any) {
    const userId = req.user.id;
    return this.refreshTokensService.findActiveTokensByUserId(userId);
  }

  // Đăng xuất một thiết bị cụ thể 
  @Delete(':id')
  @ApiOperation({summary: 'Thu hồi phiên làm việc'})
  @ApiResponse({status: 200, description: 'Trả về thông tin về phiên làm việc đã được thu hồi'})
  async revokeSession(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    // Cần thêm logic trong service để đảm bảo user chỉ xóa được token của chính mình
    return this.refreshTokensService.revokeTokenById(id, userId);
  }
}