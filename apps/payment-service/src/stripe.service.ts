import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123', {
      apiVersion: '2026-06-24.dahlia',
    });
  }

  async disburseFunds(amount: number, destination: string): Promise<any> {
    // In a real scenario we'd use Stripe Connect transfers
    return this.stripe.transfers.create({
      amount: amount,
      currency: 'usd',
      destination: destination,
    });
  }

  async createCheckoutSession(
    userId: string,
    amount: number,
  ): Promise<Stripe.Checkout.Session> {
    const successUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/payments/success`
      : 'http://localhost:3000/payments/success';
    const cancelUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/payments/cancel`
      : 'http://localhost:3000/payments/cancel';

    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Scholarship System Fee',
            },
            unit_amount: Math.round(amount * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  constructEvent(
    payload: string | Buffer,
    signature: string,
    secret: string,
  ): any {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
