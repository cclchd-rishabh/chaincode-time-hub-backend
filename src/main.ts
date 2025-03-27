import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(
        cors({
            origin: ['http://localhost:3000','https://timehub.chaincodeconsulting.com'],
            credentials: true, 
        })
    );

    await app.listen(3008);
}
bootstrap();
