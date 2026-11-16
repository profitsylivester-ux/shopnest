import helmet from 'helmet';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded, static as serveStatic } from 'express';
import { uploadDir, cloudConfig, cloudUrlFor, databaseMode, getPictureDb } from './uploads/storage.js';
import { createPictureHandler } from './uploads/picture-db.js';
import { checkRequiredEnv, frontendOrigins, jsonLimit, listenPort, rateLimitPerMinute, trustProxyHops } from './config/env.js';
import { createRateLimiter } from './common/rate-limit.js';

async function bootstrap() {
  const problems = checkRequiredEnv();
  if (problems.length > 0) {
    console.error('The API cannot start on the live server:\n - ' + problems.join('\n - '));
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // behind a host (Render and similar) every request arrives through a proxy: trust it, so the audit log
  // and the rate limits see each visitor's real address instead of the proxy's
  const hops = trustProxyHops();
  if (hops > 0) (app.getHttpAdapter().getInstance() as any).set('trust proxy', hops);

  // security headers
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // one visitor address may only make so many requests a minute (the health check and pictures are not counted)
  app.use(
    createRateLimiter({
      windowMs: 60_000,
      max: rateLimitPerMinute(),
      skip: (req) => req.path === '/health' || req.path.startsWith('/uploads/'),
    }),
  );

  // login/register bodies are tiny: reject anything over 10 KB
  app.use('/auth', (req: any, res: any, next: any) => {
    const len = Number(req.headers['content-length'] || 0);
    if (len > 10240) {
      res.status(413).json({ statusCode: 413, message: 'Request body too large' });
      return;
    }
    next();
  });

  // pictures travel as real files (see /uploads), so JSON bodies stay small
  app.use(json({ limit: jsonLimit() }));
  app.use(urlencoded({ extended: true, limit: jsonLimit() }));

  if (cloudConfig()) {
    // pictures live in the cloud bucket: send the browser there (and let it remember the answer)
    app.use('/uploads', (req: any, res: any, next: any) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      const name = String(req.path || '').replace(/^\//, '');
      if (!name) return next();
      const target = cloudUrlFor(name);
      if (!target) {
        res.status(404).json({ statusCode: 404, message: 'Not Found' });
        return;
      }
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.redirect(302, target);
    });
  } else if (databaseMode()) {
    // pictures live inside the database: read them from there (the picture store is ready once the app has started)
    app.use('/uploads', createPictureHandler({
      put: async (n, d, c) => { await getPictureDb()!.put(n, d, c); },
      get: async (n) => getPictureDb()!.get(n),
    }));
  } else {
    // uploaded pictures: names are random, so browsers can keep them for a long time
    app.use('/uploads', serveStatic(uploadDir(), { maxAge: '30d', immutable: true, index: false, dotfiles: 'ignore' }));
  }

  app.enableCors({
    origin: frontendOrigins(),
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const port = listenPort();
  await app.listen(port);
  console.log(`Backend running on port ${port} (${cloudConfig() ? 'pictures in the cloud bucket' : databaseMode() ? 'pictures in the database' : 'pictures on local disk'})`);
}
bootstrap();
