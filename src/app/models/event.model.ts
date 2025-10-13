export interface Event {
  id: string;
  subject: string;
  startTime: string;
  endTime: string;
  entityId: string;
  entityType: 'Lead' | 'Contact' | 'Company' | 'Deal';
}
