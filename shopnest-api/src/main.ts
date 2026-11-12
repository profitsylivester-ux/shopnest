import helmet from 'helmet';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // security headers
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  // login/register bodies are tiny: reject anything over 10 KB
  app.use('/auth', (req: any, res: any, next: any) => {
    const len = Number(req.headers['content-length'] || 0);
    if (len > 10240) {
      res.status(413).json({ statusCode: 413, message: 'Request body too large' });
      return;
    }
    next();
  });

  // INCREASE PAYLOAD LIMIT FOR BASE64 IMAGES
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  await app.listen(3001);
  console.log(`Backend running on: http://localhost:3001`);
}
bootstrap();