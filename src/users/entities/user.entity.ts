import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Task } from '../../tasks/entities/task.entity';
import { Profile } from '../../profile/entities/profile.entity';
import { RefreshToken } from 'src/refresh_tokens/entities/refresh_token.entity';
import { Roadmap } from '../../roadmaps/entities/roadmap.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ unique: true, nullable: true })
  googleId?: string; 

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true, eager: true })
  @JoinColumn()
  profile?: Profile;

  @OneToMany(() => Task, (task) => task.user)
  tasks!: Task[];

  @OneToMany(()=>RefreshToken, (refreshToken)=> refreshToken.user)
  refreshTokens!: RefreshToken[]; // user có thể sẽ chứa nhiều refresh token nên sẽ biểu thị thành dạng mảng

  @OneToMany(()=> Roadmap, (roadmaps) => roadmaps.user)
  roadmaps!: Roadmap[]

  @CreateDateColumn()
  createdAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPasswordAndGenerateTokenUser(): Promise<void>{
    if(this.password && !this.password.startsWith('$2')){
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}