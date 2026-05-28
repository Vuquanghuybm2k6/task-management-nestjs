import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { Task } from '../../tasks/entities/task.entity';
import { Profile } from '../../profile/entities/profile.entity';
import { RefreshToken } from 'src/refresh_tokens/entities/refresh_token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column()
  password!: string;

  // @Column({ unique: true })
  // tokenUser!: string;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true, eager: true })
  @JoinColumn()
  profile?: Profile;

  @OneToMany(() => Task, (task) => task.user)
  tasks!: Task[];

  @OneToMany(()=>RefreshToken, (refreshToken)=> refreshToken.user)
  refreshTokens!: RefreshToken[]; // user có thể sẽ chứa nhiều refresh token nên sẽ biểu thị thành dạng mảng

  @CreateDateColumn()
  createdAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPasswordAndGenerateTokenUser(): Promise<void>{
    if(this.password && !this.password.startsWith('$2')){
      this.password = await bcrypt.hash(this.password, 10);
    }
    // if(!this.tokenUser){
    //   this.tokenUser = crypto.randomBytes(16).toString('hex')
    // }
  }
}