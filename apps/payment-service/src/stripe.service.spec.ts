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
});
