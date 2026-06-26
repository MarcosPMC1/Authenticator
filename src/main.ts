import './telemetry';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { trace, SpanStatusCode } from '@opentelemetry/api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    exceptionFactory: (errors: ValidationError[]) => {
      const span = trace.getActiveSpan();

      if (span) {
        const validationErrors = errors.map(error => ({
          field: error.property,
          value: error.value,
          constraints: error.constraints,
        }));

        span.setAttribute(
          'validation.errors',
          JSON.stringify(validationErrors),
        );

        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: 'Validation failed',
        });

        span.addEvent('validation_failed', {
          errors: JSON.stringify(validationErrors),
        });
      }

      return new BadRequestException(errors);
    },
  }));
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Authenticator')
    .setDescription('Microservice for authentication and user controller')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      in: 'header',
    })
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT);

  
}
bootstrap();
