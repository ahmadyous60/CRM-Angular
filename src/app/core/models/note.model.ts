export interface Note {
  id: string;
  content: string;
  createdAt: string;
  entityId: string;
  entityType: 'Lead' | 'Contact' | 'Company' | 'Deal';
}
