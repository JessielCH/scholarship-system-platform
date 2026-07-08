import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';

class CheckoutDto {
  userId: string;
  amount: number;
}

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('user/:userId')
  async getHistory(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.paymentService.getPaymentHistory(userId);
  }

  @Post('checkout')
  async createCheckoutSession(@Body() body: CheckoutDto) {
    if (!body.userId || !body.amount) {
      throw new BadRequestException('userId and amount are required');
    }
    return this.paymentService.createCheckout(body.userId, body.amount);
  }
}
