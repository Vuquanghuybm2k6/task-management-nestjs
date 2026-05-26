import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate, OneToMany} from "typeorm";
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { Task } from "../../tasks/entities/task.entity";

@Entity('users')
export class User{
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({unique: true})
  email!: string;

  @Column()
  name!: string;

  @Column()
  password!: string;

  @Column({unique:true})
  tokenUser!: string;

  @Column({nullable: true, unique:true})
  phone?: string;

  @Column({nullable: true})
  avatar?: string;

  @Column({nullable: true})
  address?: string;

  @Column({nullable: true})
  otpCode?: string;

  @Column({nullable: true, type: 'timestamp with time zone'})
  otpExpireAt?: Date;
  
  @OneToMany(() => Task, (task) => task.user)
  tasks!: Task[];

  @CreateDateColumn()
  createdAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPasswordAndGenerateTokenUser(): Promise<void>{
    if(this.password && !this.password.startsWith('$2')){
      this.password = await bcrypt.hash(this.password, 10);
    }
    if(!this.tokenUser){
      this.tokenUser = crypto.randomBytes(16).toString('hex')
    }
  }
}