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
    (stripeService as any).stripe = {
      transfers: {
        create: jest.fn().mockResolvedValue({ id: 'tr_test_123', amount: 1000, destination: 'dest_123' }),
      },
    };
    const result = await stripeService.disburseFunds(1000, 'dest_123');
    expect(result.id).toBe('tr_test_123');
  });

  it('should construct event using mock stripe webhooks', () => {
    (stripeService as any).stripe = {
      webhooks: {
        constructEvent: jest.fn().mockReturnValue({ id: 'evt_test_123', type: 'transfer.created' }),
      },
    };
    const result = stripeService.constructEvent('payload_buffer', 'signature_header', 'whsec_secret');
    expect(result.id).toBe('evt_test_123');
  });
});
