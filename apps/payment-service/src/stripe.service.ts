import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123', {
      apiVersion: '2025-01-27.acacia',
    });
  }

  async disburseFunds(amount: number, destination: string) {
    // In a real scenario we'd use Stripe Connect transfers
    return this.stripe.transfers.create({
      amount: amount,
      currency: 'usd',
      destination: destination,
    });
  }

  constructEvent(payload: string | Buffer, signature: string, secret: string) {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
