import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Proper CORS Configuration (Avoids Multiple Values Issue)
  app.enableCors({
    origin: 'https://timehub.chaincodeconsulting.com', // Allow only your frontend
    credentials: true, // Allow cookies/session auth
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(3008);
}
bootstrap();
