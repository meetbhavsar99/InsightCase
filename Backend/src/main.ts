import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionFilter, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import crypto from 'crypto';
import { UnauthorizedExceptionFilter } from './shared/filters/unauthorized-exception.filter';
import { InternalServerErrorExceptionFilter } from './shared/filters/internalServerError-exception.filter';
import * as passport from 'passport';

// Session Management - Using HTTPS?
// let isSessionSecure = true;

// // Set development configs here.
// if (process.env.NODE_ENV === 'development') {
//   console.log('Server starting for Development.');
//   isSessionSecure = false;
// }

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: (origin, callback) => {
      console.log('Origin:', origin); // Log the origin of the incoming request
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
  });
  const configService = app.get(ConfigService);
  // Set Route Prefix to begin with /api/. E.g. localhost:3000/api
  // app.setGlobalPrefix('api');
  // // Enable API Version route prefix. E.g. localhost:3000/api/v1/route
  // app.enableVersioning({
  //   type: VersioningType.URI,
  //   defaultVersion: '1',
  // });
  const options = new DocumentBuilder()
    .setTitle('Case Management Tool API')
    .setDescription(
      'Document for APIs and DTOs with example developed for Insight Advantage (Case Management Tool)',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:3001/', 'Local environment')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      // forbidNonWhitelisted: true, // Helps prevent unwanted properties
      // transformOptions: {
      //   enableImplicitConversion: true, // Auto-converts data types
      // },
    }),
  );
  app.use(
    session({
      // Generate a random session secret if not provided.
      secret:
        configService.get<string>('SESSION_SECRET_KEY') || crypto.randomBytes(32).toString('hex'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Set to false for development (true for production with HTTPS)
        httpOnly: true, // Cookie cannot be accessed via JavaScript
        maxAge: 60 * 60 * 1000, // 1 hour
      },
    }),
  );

  // app.use(passport.initialize());
  // app.use(passport.session());

  const filters: ExceptionFilter<any>[] = [
    new UnauthorizedExceptionFilter(),
    new InternalServerErrorExceptionFilter(),
  ];

  filters.forEach((filter) => app.useGlobalFilters(filter));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap();
