import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @Index()
  token!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ default: false })
  isRevoked!: boolean; // cột này để xem xem token đã bị vô hiệu hóa chưa, false: còn dùng được; true: đã bị thu hồi hoặc logout

  //Thay @Column() bằng @CreateDateColumn() để tự động lưu thời gian tạo
  @CreateDateColumn({ type: 'timestamp' }) 
  createdAt!: Date;

  @Column({ nullable: true })
  userAgent!: string; // Lưu thông tin trình duyệt (ví dụ: Chrome, Safari)

  @Column({ nullable: true })
  ipAddress!: string; // Lưu IP để tăng cường bảo mật, cảnh báo khi lạ

  // Khai báo rõ ràng cột userId để tiện query mà không cần load cả Object User
  @Column()
  userId!: string;

  // Thiết lập quan hệ với bảng User
  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  // Cơ chế xoay vòng token: nếu token bị xoay vòng, lưu token mới thay thế token cũ
  @Column({ nullable: true })
  replaceByTokenId!: string;

  @Column({ nullable: true }) // Gợi ý: Nên để nullable: true đề phòng trường hợp không phân tách được thiết bị từ userAgent
  deviceInfo!: string; // Lưu thông tin thiết bị (ví dụ: "iPhone 12", "Dell XPS 15") để người dùng có thể quản lý các thiết bị đã đăng nhập

  // Kiểm tra xem token còn hạn và chưa bị thu hồi không
  get isExpired(): boolean {
    return new Date() >= this.expiresAt;
  }

  // Token được coi là hoạt động nếu nó chưa bị thu hồi và chưa hết hạn
  get isActive(): boolean { 
    return !this.isRevoked && !this.isExpired;
  }
}