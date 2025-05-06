
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
  },
  {
    name: "leads",
    description: "Лиды - потенциальные клиенты",
    fields: [
      {
        name: "lead_id",
        type: "Serial",
        required: true
      },
      {
        name: "name",
        type: "Text"
      },
      {
        name: "phone",
        type: "Text"
      },
      {
        name: "email",
        type: "Text"
      },
      {
        name: "lead_source",
        type: "Text",
        options: [
          "Веб-сайт Tilda",
          "Телефонный звонок",
          "Email-рассылка",
          "Партнер",
          "Мероприятие",
          "Другое"
        ]
      },
      {
        name: "client_language",
        type: "Text",
        options: ["ES", "EN", "RU"]
      },
      {
        name: "lead_status",
        type: "Text",
        options: [
          "Новый",
          "В обработке",
          "Квалифицирован",
          "Некачественный лид",
          "Конвертирован"
        ]
      },
      {
        name: "initial_comment",
        type: "Text"
      },
      {
        name: "creation_date",
        type: "Timestamp with time zone",
        required: true,
        defaultValue: "NOW()"
      },
      {
        name: "assigned_user_id",
        type: "UUID",
        reference: {
          table: "profiles",
          field: "id"
        }
      },
      {
        name: "creator_user_id",
        type: "UUID",
        reference: {
          table: "profiles",
          field: "id"
        }
      }
    ]
  }
];
