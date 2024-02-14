import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { StripeModule } from './modules/stripe/stripe.module';
@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    MulterModule.register({
      dest: './public',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: [
        '/api/(.*)',
        '/docs'
      ],
      serveRoot: '/public',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 1000,
    }]),
    ProductModule,
    OrderModule,
    StripeModule,


  ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule { }
