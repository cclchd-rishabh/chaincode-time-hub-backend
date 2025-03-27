import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Comprehensive CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000', 
        'https://timehub.chaincodeconsulting.com',
        'https://www.timehub.chaincodeconsulting.com'
      ];
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'), false);
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With', 
      'Accept', 
      'Origin'
    ],
    credentials: true,
    maxAge: 3600, // Preflight request caching
  });
  
  // Serve static files for uploads
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Additional security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  await app.listen(3008);
  console.log('Server running on port 3008');
}
bootstrap();