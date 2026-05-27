import { Column, Entity, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true, unique: true })
  phone?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  otpCode?: string;

  @Column({ nullable: true, type: 'timestamp with time zone' })
  otpExpireAt?: Date;

  @Column({ nullable: true, unique: true })
  googleId?: string;

  @OneToOne(() => User, (user) => user.profile)
  user!: User;
}
