import { ID } from './id.type';

export interface Company {
  id: ID;
  name: string;
  industry?: string;
  website?: string;
  createdAt: string;
}
