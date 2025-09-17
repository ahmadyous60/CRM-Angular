import { ID } from './id.type';
import { productOptions } from '../models/product-options.const'

export interface Lead {
  id: ID;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Qualified' | 'Won' | 'Lost';
  source: 'Website' | 'Referral' | 'Email' | 'Cold Call';
  productCategory: keyof typeof productOptions;
  product: string;
  createdAt: string;
}
