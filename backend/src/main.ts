import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS
  app.enableCors();

  // Global API Prefix
  app.setGlobalPrefix('api', {
    exclude: ['api'], // Exclude Swagger docs from prefix
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('JJIban API')
    .setDescription('AI-Assisted Development Kanban Tool API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 JJIban Backend is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📚 API Documentation: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
