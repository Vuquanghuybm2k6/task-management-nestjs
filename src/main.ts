import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3001', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Cho phép nhận Cookie
  });
  app.use(cookieParser());
  const config = new DocumentBuilder()
    .setTitle('Dự án NestJS - Task Management API')
    .setDescription('Tài liệu hướng dẫn sử dụng API của tôi')
    .setVersion('1.0')
    .addTag('tasks') // Nhóm các API liên quan đến Task lại
    .addTag('users') // Nhóm các API liên quan đến User lại
    .addBearerAuth() 
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
