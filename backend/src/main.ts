import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Main Entry Point for CricV NestJS Backend Server
 * 
 * LOCAL DEVELOPMENT STEPS:
 * 1. cd backend
 * 2. npm install
 * 3. Configure PostgreSQL connection string in .env (DATABASE_URL)
 * 4. Run Prisma schema generation: npx prisma generate
 * 5. Run Prisma database push (syncs schema to PostgreSQL): npx prisma db push
 * 6. Start NestJS dev server: npm run start:dev
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so React Native / Expo / Web frontend can communicate smoothly with backend
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable automatic validation for incoming Request DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 CricV NestJS Backend Server running at http://localhost:${port}`);
}

bootstrap();
