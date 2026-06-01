import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Tree, TreeParent, TreeChildren } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Roadmap } from 'src/roadmaps/entities/roadmap.entity';
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

@Entity('tasks')
@Tree('closure-table') // kích hoạt closure table
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status!: TaskStatus;

  // --- QUAN HỆ PHÂN CẤP ---
  @TreeParent()
  parent!: Task;

  @TreeChildren()
  subTasks!: Task[];

  @Column({ nullable: true })
  userId!: string;

  @Column({ nullable: true })
  roadmapId!: string;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(()=> Roadmap, (roadmap) => roadmap.tasks, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'roadmapId'})
  roadmap!: Roadmap

  @CreateDateColumn()
  createdAt!: Date;
}
