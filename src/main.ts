import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: ['http://localhost:3000', 'https://timehub.chaincodeconsulting.com','*'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],

    credentials: true,
    preflightContinue: false, // Ensures the browser doesn't block preflight

  });
  
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  await app.listen(4000);
}
bootstrap();
