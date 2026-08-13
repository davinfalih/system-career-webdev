import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.use(cookieParser());
  app.use(express.text({ type: 'text/plain', limit: '5mb' }));
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  Logger.log(`JobMatch API running on http://localhost:${port}/api`, 'Bootstrap');
}
bootstrap();
