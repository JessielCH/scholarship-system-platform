import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request } from 'express';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('stripe')
  async handleStripeWebhook(@Req() req: RawBodyRequest<Request>) {
    let event;
    try {
      // Temporarily bypass signature validation for Postman testing
      event = req.rawBody ? JSON.parse(req.rawBody.toString()) : req.body;
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(
          `PaymentIntent for ${paymentIntent.amount} was successful!`,
        );
        break;
      }
      case 'transfer.created': {
        const transfer = event.data.object;
        console.log(`Transfer for ${transfer.amount} created!`);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }
}
