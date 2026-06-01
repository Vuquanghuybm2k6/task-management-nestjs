import { Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, Entity, JoinColumn } from "typeorm";
import {User} from "../../users/entities/user.entity"
import {Task} from "../../tasks/entities/task.entity"

@Entity('roadmaps')
export class Roadmap {

  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  title!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ default: false })
  isPublic!: boolean

  @ManyToOne(()=> User, (user)=> user.roadmaps)
  @JoinColumn({name: 'userId'})
  user!: User

  @OneToMany(()=> Task, (task) => task.roadmap)
  tasks!: Task[]

  @CreateDateColumn()
  createdAt!: Date
}
