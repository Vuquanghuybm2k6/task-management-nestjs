import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ProductsController } from './products/products.controller';
import { ProductsModule } from './products/products.module';
import { RefreshTokensModule } from './refresh_tokens/refresh_tokens.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Giúp dùng được ConfigService ở mọi nơi mà không cần import lại
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadEntities: true, // Tự động nạp các Entity vào database
        synchronize: true, // Tự động sync code với DB (Chỉ dùng khi code, không dùng khi deploy thật)
      }),
    }),
    AuthModule,
    TasksModule,
    UsersModule,
    ProfileModule,
    ProductsModule,
    RefreshTokensModule,
  ],
  controllers: [ProductsController],
})
export class AppModule {}