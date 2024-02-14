import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, RequestMethod, VERSION_NEUTRAL, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {

  // Load environment variables from .env file
  const logger = new Logger();

  const port = process.env.PORT || 4000;
  const app_debug = process.env.APP_DEBUG || false;


  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.use(cookieParser());
  app.useBodyParser('json', { limit: '20mb' });


  app.useStaticAssets(join(__dirname, '..', 'public'));


  // cors
  app.enableCors({
    origin: "*",
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable trust for the proxy
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  // prefix
  app.setGlobalPrefix('api', {
    exclude: [
      { path: '/', method: RequestMethod.GET },
      { path: 'docs', method: RequestMethod.GET },
    ],
  });

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('docs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);


  // Log each request
  app.use((req: any, res: any, next: any) => {
    logger.log(`Request ${req.method} ${req.originalUrl}`);
    next();
  });

  (app as any).set('etag', false);

  app.use((req, res, next) => {
    res.removeHeader('x-powered-by');
    res.removeHeader('date');
    next();
  });

  // app.use('/api/webhook', (req, res, next) => {
  //   req.rawBody = '';
  //   req.on('data', (chunk) => {
  //     req.rawBody += chunk;
  //   });
  //   req.on('end', () => {
  //     next();
  //   });
  // });

  logger.log(`Server running on http://localhost:${port}`);

  await app.listen(port);
}
bootstrap();
