import { Transaction } from './transaction.entity';

describe('Transaction Entity', () => {
  it('should create a valid transaction entity instance', () => {
    const transaction = new Transaction();
    transaction.id = '123e4567-e89b-12d3-a456-426614174000';
    transaction.sagaId = 'saga-999';
    transaction.amount = 250.75;
    transaction.destinationAccount = 'acct_123';
    transaction.status = 'COMPLETED';
    transaction.createdAt = new Date('2026-01-01T00:00:00Z');
    transaction.updatedAt = new Date('2026-01-01T01:00:00Z');

    expect(transaction).toBeDefined();
    expect(transaction.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(transaction.sagaId).toBe('saga-999');
    expect(transaction.amount).toBe(250.75);
    expect(transaction.status).toBe('COMPLETED');
    expect(transaction.createdAt).toBeInstanceOf(Date);
    expect(transaction.updatedAt).toBeInstanceOf(Date);
  });
});
