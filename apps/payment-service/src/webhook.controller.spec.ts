/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { WebhookController } from './webhook.controller';
import { StripeService } from './stripe.service';

describe('WebhookController', () => {
  let webhookController: WebhookController;
  let stripeService: StripeService;

  beforeEach(() => {
    stripeService = new StripeService();
    webhookController = new WebhookController(stripeService);
  });

  it('should be defined', () => {
    expect(webhookController).toBeDefined();
  });

  it('should handle payment_intent.succeeded event', async () => {
    const mockReq = {
      rawBody: Buffer.from(
        JSON.stringify({
          type: 'payment_intent.succeeded',
          data: { object: { amount: 1000 } },
        }),
      ),
    } as any;

    const result = await webhookController.handleStripeWebhook(
      mockReq,
      'mock-signature',
    );
    expect(result).toEqual({ received: true });
  });

  it('should handle transfer.created event', async () => {
    const mockReq = {
      rawBody: Buffer.from(
        JSON.stringify({
          type: 'transfer.created',
          data: { object: { amount: 500 } },
        }),
      ),
    } as any;

    const result = await webhookController.handleStripeWebhook(
      mockReq,
      'mock-signature',
    );
    expect(result).toEqual({ received: true });
  });

  it('should handle unknown event type gracefully', async () => {
    const mockReq = {
      rawBody: Buffer.from(
        JSON.stringify({
          type: 'unknown.event',
          data: { object: {} },
        }),
      ),
    } as any;

    const result = await webhookController.handleStripeWebhook(
      mockReq,
      'mock-signature',
    );
    expect(result).toEqual({ received: true });
  });

  it('should handle body fallback when rawBody is undefined', async () => {
    const mockReq = {
      rawBody: undefined,
      body: {
        type: 'payment_intent.succeeded',
        data: { object: { amount: 2000 } },
      },
    } as any;

    const result = await webhookController.handleStripeWebhook(
      mockReq,
      'mock-signature',
    );
    expect(result).toEqual({ received: true });
  });
});
