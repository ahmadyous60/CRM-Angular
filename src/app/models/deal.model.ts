import { ID } from './id.type';

export interface Deal {
  id: ID;
  title: string;
  amount: number;
  stage: 'Prospecting' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  closeDate?: string;
  contactId?: ID;
  companyId?: ID;
  createdAt: string;
}
