import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);


  app.enableCors({
    origin: 'https://timehub.chaincodeconsulting.com', // Allow only your frontend in production
    // origin: 'http://localhost:3000',
    credentials: true, // Allow cookies/session auth
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads', // Access files via http://localhost:3008/uploads/filename.png
  });

  await app.listen(3008);
}
bootstrap();
