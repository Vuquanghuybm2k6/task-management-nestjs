import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile) private readonly profileRepository: Repository<Profile>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findByUserId(userId: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Profile không tồn tại');
    }
    return profile;
  }

  async updateByUserId(userId: string, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    let profile: Profile | undefined = user.profile;
    if (!profile) {
      profile = this.profileRepository.create({
        ...updateProfileDto,
        user,
      } as unknown as Profile);
    } else {
      Object.assign(profile, updateProfileDto);
    }

    return this.profileRepository.save(profile);
  }
}
