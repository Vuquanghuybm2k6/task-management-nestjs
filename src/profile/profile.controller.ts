import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':userId')
  async getProfile(@Param('userId') userId: string): Promise<ProfileResponseDto> {
    const profile = await this.profileService.findByUserId(userId);
    return {
      id: profile.id,
      phone: profile.phone,
      avatar: profile.avatar,
      address: profile.address,
      googleId: profile.googleId,
      userId: profile.user.id,
    };
  }

  @Put(':userId')
  async updateProfile(
    @Param('userId') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    const profile = await this.profileService.updateByUserId(userId, updateProfileDto);
    return {
      id: profile.id,
      phone: profile.phone,
      avatar: profile.avatar,
      address: profile.address,
      googleId: profile.googleId,
      userId: profile.user.id,
    };
  }
}
