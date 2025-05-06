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
  },
  {
    name: "companies",
    description: "Компании-клиенты системы",
    fields: [
      {
        name: "company_id",
        type: "Serial",
        required: true
      },
      {
        name: "company_name",
        type: "Text",
        required: true
      },
      {
        name: "nif_cif",
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
        name: "address",
        type: "Text"
      },
      {
        name: "industry",
        type: "Text",
        options: [
          "Розничная торговля",
          "Дизайн интерьера",
          "Строительство",
          "Другое"
        ]
      },
      {
        name: "notes",
        type: "Text"
      },
      {
        name: "creation_date",
        type: "Timestamp with time zone",
        required: true,
        defaultValue: "NOW()"
      },
      {
        name: "owner_user_id",
        type: "UUID",
        reference: {
          table: "profiles",
          field: "id"
        }
      }
    ]
  },
  {
    name: "contacts",
    description: "Контакты клиентов",
    fields: [
      {
        name: "contact_id",
        type: "Serial",
        required: true
      },
      {
        name: "full_name",
        type: "Text",
        required: true
      },
      {
        name: "primary_phone",
        type: "Text"
      },
      {
        name: "secondary_phone",
        type: "Text"
      },
      {
        name: "primary_email",
        type: "Text"
      },
      {
        name: "secondary_email",
        type: "Text"
      },
      {
        name: "delivery_address_street",
        type: "Text"
      },
      {
        name: "delivery_address_number",
        type: "Text"
      },
      {
        name: "delivery_address_apartment",
        type: "Text"
      },
      {
        name: "delivery_address_city",
        type: "Text"
      },
      {
        name: "delivery_address_postal_code",
        type: "Text"
      },
      {
        name: "delivery_address_country",
        type: "Text",
        defaultValue: "'Spain'"
      },
      {
        name: "notes",
        type: "Text"
      },
      {
        name: "attached_files_general",
        type: "Json"
      },
      {
        name: "creation_date",
        type: "Timestamp with time zone",
        required: true,
        defaultValue: "NOW()"
      },
      {
        name: "owner_user_id",
        type: "UUID",
        reference: {
          table: "profiles",
          field: "id"
        }
      },
      {
        name: "associated_company_id",
        type: "Integer",
        reference: {
          table: "companies",
          field: "company_id"
        }
      }
    ]
  }
];
