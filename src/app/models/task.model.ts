export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
  entityId: string;
  entityType: 'Lead' | 'Contact' | 'Company' | 'Deal';
}
