
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
    name: "Leads",
    description: "Хранение информации о лидах",
    fields: [
      {
        name: "leadID",
        type: "Уникальный идентификатор",
        required: true,
      },
      {
        name: "name",
        type: "Text",
        required: true,
      },
      {
        name: "phone",
        type: "Text",
        required: false,
      },
      {
        name: "email",
        type: "Email",
        required: false,
      },
      {
        name: "leadSource",
        type: "Select",
        options: [
          "Сайт - форма контактов",
          "Сайт - форма кастом (Tilda)",
          "Звонок",
          "Соцсеть",
          "Рекомендация",
          "Другое"
        ],
        required: true,
      },
      {
        name: "clientLanguage",
        type: "Select",
        options: ["ES", "EN", "RU"],
        required: true,
      },
      {
        name: "leadStatus",
        type: "Select",
        options: ["Новый", "В обработке", "Квалифицирован", "Некачественный"],
        required: true,
      },
      {
        name: "initialComment",
        type: "Textarea",
        required: false,
      },
      {
        name: "creationDate",
        type: "Date",
        required: true,
        defaultValue: "current_date",
      },
      {
        name: "assignedManagerEmail",
        type: "Email",
        required: true,
      },
    ],
  },
  {
    name: "Contacts",
    description: "Хранение информации о клиентах/контактах",
    fields: [
      {
        name: "contactID",
        type: "Уникальный идентификатор",
        required: true,
      },
      {
        name: "fullName",
        type: "Text",
        required: true,
      },
      {
        name: "primaryPhone",
        type: "Text",
        required: true,
      },
      {
        name: "secondaryPhone",
        type: "Text",
        required: false,
      },
      {
        name: "primaryEmail",
        type: "Email",
        required: true,
      },
      {
        name: "secondaryEmail",
        type: "Email",
        required: false,
      },
      {
        name: "clientLanguage",
        type: "Select",
        options: ["ES", "EN", "RU"],
        required: true,
      },
      {
        name: "deliveryAddress_Street",
        type: "Text",
        required: false,
      },
      {
        name: "deliveryAddress_Number",
        type: "Text",
        required: false,
      },
      {
        name: "deliveryAddress_City",
        type: "Text",
        required: false,
      },
      {
        name: "deliveryAddress_PostalCode",
        type: "Text",
        required: false,
      },
      {
        name: "notes",
        type: "Textarea",
        required: false,
      },
      {
        name: "attachedFiles_General",
        type: "Multiple Files",
        required: false,
      },
      {
        name: "creationDate",
        type: "Date",
        required: true,
        defaultValue: "current_date",
      },
      {
        name: "associatedCompanyID",
        type: "Reference",
        required: false,
        reference: {
          table: "Companies",
          field: "companyID"
        }
      },
    ],
  },
  {
    name: "Companies",
    description: "Хранение информации о компаниях",
    fields: [
      {
        name: "companyID",
        type: "Уникальный идентификатор",
        required: true,
      },
      {
        name: "companyName",
        type: "Text",
        required: true,
      },
      {
        name: "nif_cif",
        type: "Text",
        required: false,
      },
      {
        name: "phone",
        type: "Text",
        required: true,
      },
      {
        name: "email",
        type: "Email",
        required: true,
      },
      {
        name: "address",
        type: "Textarea",
        required: true,
      },
      {
        name: "industry",
        type: "Select",
        options: [
          "Дизайнер интерьеров",
          "Отель",
          "Ресторан",
          "Застройщик",
          "Другое"
        ],
        required: true,
      },
      {
        name: "notes",
        type: "Textarea",
        required: false,
      },
      {
        name: "creationDate",
        type: "Date",
        required: true,
        defaultValue: "current_date",
      },
    ],
  },
];
