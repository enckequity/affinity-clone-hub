
export interface EntityNote {
  entityId: string;
  entityName: string;
  entityType: 'company' | 'contact';
  content: string;
  isValid?: boolean;
}
