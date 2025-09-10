export type ID = string;

export interface Lead {
  id: ID;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Qualified' | 'Won' | 'Lost';
  source: 'Website' | 'Referral' | 'Email' | 'Cold Call';
  productCategory: keyof typeof productOptions; 
  product: string; 
  createdAt: string; // ISO
}

// Define products mapped to each category
export const productOptions = {
  Software: [
    'Software License',
    'CRM Subscription'
  ],
  'Web Development': [
    'Website Development',
    'E-commerce Solution'
  ],
  'Mobile Apps': [
    'Mobile App Development'
  ],
  'Digital Marketing': [
    'SEO Package',
    'Social Media Marketing'
  ],
  'Cloud Services': [
    'Cloud Hosting'
  ],
} as const;


export interface Deal {
  id: ID;
  title: string;
  amount: number;
  stage: 'Prospecting'|'Proposal'|'Negotiation'|'Closed Won'|'Closed Lost';
  closeDate?: string; // ISO
  contactId?: ID;
  companyId?: ID;
  createdAt: string;
}

export interface Contact {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyId?: ID;
  createdAt: string;
}

export interface Company {
  id: ID;
  name: string;
  industry?: string;
  website?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
  entityId: string;
  entityType: "Lead" | "Contact" | "Company" | "Deal" 
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  entityId: string;
  entityType: "Lead" | "Contact" | "Company" | "Deal"
}

export interface Event {
  id: string;
  subject: string;
  startTime: string;
  endTime: string;
  entityId: string;
  entityType: "Lead" | "Contact" | "Company" | "Deal"
}


export interface User {
  id: number;
  name: string;
  username: string;
}