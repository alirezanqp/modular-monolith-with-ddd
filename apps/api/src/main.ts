import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { ProblemDetailsFilter } from './filters/problem-details.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new ProblemDetailsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: false,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MyMeetings API')
    .setDescription('Modular Monolith with DDD — NestJS port')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('swagger', app, SwaggerModule.createDocument(app, swaggerConfig));

  const config = app.get(ConfigService);
  const port = Number(config.get('PORT', 5000));
  await app.listen(port);
}

bootstrap();
