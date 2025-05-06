
export interface FieldDefinition {
  name: string;
  type: string;
  options?: string[];
  required?: boolean;
  defaultValue?: string;
  reference?: {
    table: string;
    field: string;
  };
}

export interface TableDefinition {
  name: string;
  description: string;
  fields: FieldDefinition[];
}

export const databaseSchema: TableDefinition[] = [];

