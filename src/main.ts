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
<<<<<<< HEAD
    credentials: true,
    preflightContinue: false, // Ensures the browser doesn't block preflight
=======
    // credentials: true,
    preflightContinue: false, // Ensures the browser doesn't block prefligh
>>>>>>> 356df2002fc83019e5bb5bdab0d1a9e23e293147
  });
  
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  await app.listen(4000);
}
bootstrap();
