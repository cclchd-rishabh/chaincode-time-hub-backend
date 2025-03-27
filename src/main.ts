import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: '*',  // Change this to your frontend domain in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true, // If using cookies or authentication
  });
  
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  await app.listen(4000);
}
bootstrap();
