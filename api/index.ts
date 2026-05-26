import type { VercelRequest, VercelResponse } from '@vercel/node';
import { NestFactory } from '@nestjs/core';
import serverless from '@vendia/serverless-express';
import { AppModule } from '../src/app.module';

let server: ReturnType<typeof serverless> | null = null;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: false });
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverless({ app: expressApp });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!server) {
    server = await bootstrap();
  }

  return server(req, res);
}
