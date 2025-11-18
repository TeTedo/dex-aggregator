import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정 (프론트엔드와 통신을 위해)
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `🚀 DEX Aggregator API is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
}
bootstrap();
