import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { StripeService } from './stripe.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly stripeService: StripeService,
  ) {}

  async getPaymentHistory(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async createCheckout(
    userId: string,
    amount: number,
  ): Promise<{ url: string }> {
    // 1. Create a Stripe Checkout Session
    const session = await this.stripeService.createCheckoutSession(
      userId,
      amount,
    );

    // 2. Create a pending transaction record
    const transaction = this.transactionRepository.create({
      userId,
      sagaId: session.id, // Using the checkout session ID as reference for webhook matching
      amount,
      destinationAccount: 'platform', // Default destination for general checkout
      status: 'PENDING',
    });

    await this.transactionRepository.save(transaction);

    // 3. Return the URL for frontend redirection
    return { url: session.url || '' };
  }
}
