import { ID } from './id.type';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  mobile?: string | null;
  dob?: Date | string | null;
  reportingTo?: string | null;

  mailingStreet?: string | null;
  otherStreet?: string | null;
  mailingCity?: string | null;
  otherCity?: string | null;
  mailingState?: string | null;
  otherState?: string | null;
  mailingZip?: string | null;
  mailingCountry?: string | null;

  companyId?: string | null;
  createdAt: Date | string;
}
