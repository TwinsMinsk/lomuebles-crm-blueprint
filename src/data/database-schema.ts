
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

export const databaseSchema: TableDefinition[] = [
  {
    name: "profiles",
    description: "Профили пользователей системы",
    fields: [
      {
        name: "id",
        type: "UUID",
        required: true,
        reference: {
          table: "auth.users",
          field: "id"
        }
      },
      {
        name: "email",
        type: "Text",
        required: true
      },
      {
        name: "role",
        type: "Enum",
        options: [
          "Главный Администратор",
          "Администратор",
          "Менеджер",
          "Замерщик",
          "Дизайнер",
          "Монтажник"
        ],
        required: true,
        defaultValue: "Менеджер"
      },
      {
        name: "full_name",
        type: "Text"
      },
      {
        name: "registration_date",
        type: "Timestamp with time zone",
        required: true,
        defaultValue: "NOW()"
      },
      {
        name: "is_active",
        type: "Boolean",
        required: true,
        defaultValue: "TRUE"
      }
    ]
  }
];
