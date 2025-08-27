
export type BillingCycle = 'monthly' | 'yearly' | 'one-time';

export interface Subscription {
  id: string;
  serviceProvider: string;
  startDate: string;
  renewalDate: string;
  amount: number;
  billingCycle: BillingCycle;
  details: string;
}

export type SortKey = 'renewalDate' | 'serviceProvider' | 'amount';
