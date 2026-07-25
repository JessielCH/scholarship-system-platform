import { StripeService } from './stripe.service';

describe('StripeService', () => {
  let stripeService: StripeService;

  beforeEach(() => {
    stripeService = new StripeService();
  });

  it('should be defined', () => {
    expect(stripeService).toBeDefined();
  });

  it('should have disburseFunds method', () => {
    expect(typeof stripeService.disburseFunds).toBe('function');
  });

  it('should have constructEvent method', () => {
    expect(typeof stripeService.constructEvent).toBe('function');
  });

  it('should execute disburseFunds using mock stripe transfers', async () => {
    const result = await stripeService.disburseFunds(1000, 'dest_123');
    expect(result.id).toBe('mock_transfer_123');
    expect(result.amount).toBe(1000);
    expect(result.destination).toBe('dest_123');
    expect(result.status).toBe('succeeded');
  });

  it('should construct event using mock stripe webhooks', () => {
    const result = stripeService.constructEvent('payload_buffer', 'signature_header', 'whsec_secret');
    expect(result.type).toBe('checkout.session.completed');
    expect(result.data.object.client_reference_id).toBe('mock_user');
  });
});
