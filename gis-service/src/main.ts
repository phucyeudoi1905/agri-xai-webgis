import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { resolve } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const isProd = process.env.NODE_ENV === 'production';

  const corsOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
    exposedHeaders: ['X-Request-Id'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const qrDir = resolve(process.env.QR_STORAGE_PATH || './storage/qr');
  app.useStaticAssets(qrDir, { prefix: '/storage/qr/' });

  if (!isProd) {
    const swagger = new DocumentBuilder()
      .setTitle('Agri XAI — GIS Service')
      .setDescription('Web GIS API Nhóm 2 — PUC / Spatial / Traceability')
      .setVersion('0.1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'jwt')
      .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'apiKey')
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));
  }

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`GIS Service listening on http://localhost:${port}`);
  if (!isProd) {
    // eslint-disable-next-line no-console
    console.log(`Swagger: http://localhost:${port}/docs`);
  }
}
bootstrap();
