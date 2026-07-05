import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StripeService } from './stripe.service';
import { WebhookController } from './webhook.controller';
import { Transaction } from './transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DB_HOST || 'localhost',
      port: 3306,
      username: process.env.DB_USER || 'payment_user',
      password: process.env.DB_PASSWORD || 'payment_password',
      database: process.env.DB_NAME || 'payment_db',
      entities: [Transaction],
      synchronize: true, // Use only in dev
    }),
    TypeOrmModule.forFeature([Transaction]),
  ],
  controllers: [AppController, WebhookController],
  providers: [AppService, StripeService],
})
export class AppModule {}
