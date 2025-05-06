
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
  },
  {
    name: "partners_manufacturers",
    description: "Партнеры-изготовители",
    fields: [
      {
        name: "partner_manufacturer_id",
        type: "Serial",
        required: true
      },
      {
        name: "company_name",
        type: "Text",
        required: true
      },
      {
        name: "contact_person",
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
        name: "specialization",
        type: "Text"
      },
      {
        name: "terms",
        type: "Text"
      },
      {
        name: "requisites",
        type: "Text"
      },
      {
        name: "attached_files_partner_docs",
        type: "Json"
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
    name: "deals_orders",
    description: "Заказы и сделки",
    fields: [
      {
        name: "deal_order_id",
        type: "Serial",
        required: true
      },
      {
        name: "order_number",
        type: "Text",
        required: true
      },
      {
        name: "order_name",
        type: "Text"
      },
      {
        name: "order_type",
        type: "Text",
        required: true,
        options: [
          "Готовая мебель (Tilda)",
          "Мебель на заказ"
        ]
      },
      {
        name: "status_ready_made",
        type: "Text",
        options: [
          "Новый",
          "Ожидает подтверждения",
          "Ожидает оплаты",
          "Оплачен",
          "Передан на сборку",
          "Готов к отгрузке",
          "В доставке",
          "Выполнен",
          "Отменен"
        ]
      },
      {
        name: "status_custom_made",
        type: "Text",
        options: [
          "Новый запрос",
          "Предварительная оценка",
          "Согласование ТЗ/Дизайна",
          "Ожидает замера",
          "Замер выполнен",
          "Проектирование",
          "Согласование проекта",
          "Ожидает предоплаты",
          "В производстве",
          "Готов к монтажу",
          "Монтаж",
          "Завершен",
          "Отменен"
        ]
      },
      {
        name: "final_amount",
        type: "Numeric(10, 2)"
      },
      {
        name: "associated_contact_id",
        type: "Integer",
        required: true,
        reference: {
          table: "contacts",
          field: "contact_id"
        }
      },
      {
        name: "associated_company_id",
        type: "Integer",
        reference: {
          table: "companies",
          field: "company_id"
        }
      },
      {
        name: "source_lead_id",
        type: "Integer",
        reference: {
          table: "leads",
          field: "lead_id"
        }
      },
      {
        name: "client_language",
        type: "Text",
        required: true,
        options: ["ES", "EN", "RU"]
      },
      {
        name: "creation_date",
        type: "Timestamp with time zone",
        required: true,
        defaultValue: "NOW()"
      },
      {
        name: "closing_date",
        type: "Timestamp with time zone"
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
        name: "delivery_address_full",
        type: "Text"
      },
      {
        name: "payment_status",
        type: "Text",
        options: [
          "Не оплачен",
          "Частично оплачен",
          "Оплачен полностью",
          "Возврат"
        ]
      },
      {
        name: "notes_history",
        type: "Text"
      },
      {
        name: "attached_files_order_docs",
        type: "Json"
      },
      {
        name: "associated_partner_manufacturer_id",
        type: "Integer",
        reference: {
          table: "partners_manufacturers",
          field: "partner_manufacturer_id"
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
    name: "order_items",
    description: "Позиции в заказе",
    fields: [
      {
        name: "order_item_id",
        type: "Serial",
        required: true
      },
      {
        name: "parent_deal_order_id",
        type: "Integer",
        required: true,
        reference: {
          table: "deals_orders",
          field: "deal_order_id"
        }
      },
      {
        name: "product_name_from_tilda",
        type: "Text",
        required: true
      },
      {
        name: "sku_from_tilda",
        type: "Text"
      },
      {
        name: "quantity",
        type: "Integer",
        required: true,
        defaultValue: "1"
      },
      {
        name: "price_per_item_from_tilda",
        type: "Numeric",
        required: true
      },
      {
        name: "total_item_price",
        type: "Numeric",
        required: true
      },
      {
        name: "link_to_product_on_tilda",
        type: "Text"
      }
    ]
  },
  {
    name: "custom_requests",
    description: "Запросы на индивидуальное изготовление",
    fields: [
      {
        name: "custom_request_id",
        type: "Serial",
        required: true
      },
      {
        name: "request_name",
        type: "Text"
      },
      {
        name: "request_status",
        type: "Text",
        options: [
          "Новый",
          "В обработке",
          "Требует уточнения",
          "Оценен",
          "Отклонен",
          "Передан в заказ"
        ]
      },
      {
        name: "associated_contact_id",
        type: "Integer",
        required: true,
        reference: {
          table: "contacts",
          field: "contact_id"
        }
      },
      {
        name: "associated_company_id",
        type: "Integer",
        reference: {
          table: "companies",
          field: "company_id"
        }
      },
      {
        name: "client_description",
        type: "Text"
      },
      {
        name: "attached_files_sketch",
        type: "Json"
      },
      {
        name: "desired_materials",
        type: "Text"
      },
      {
        name: "estimated_dimensions",
        type: "Text"
      },
      {
        name: "desired_completion_date",
        type: "Date"
      },
      {
        name: "preliminary_cost",
        type: "Numeric(10, 2)"
      },
      {
        name: "linked_deal_order_id",
        type: "Integer",
        reference: {
          table: "deals_orders",
          field: "deal_order_id"
        }
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
        name: "creation_date",
        type: "Timestamp with time zone",
        required: true,
        defaultValue: "NOW()"
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
    name: "products",
    description: "Внутренний справочник товаров и шаблонов",
    fields: [
      {
        name: "product_id",
        type: "Serial",
        required: true
      },
      {
        name: "internal_product_name",
        type: "Text",
        required: true
      },
      {
        name: "internal_sku",
        type: "Text"
      },
      {
        name: "description",
        type: "Text"
      },
      {
        name: "base_price",
        type: "Numeric(10, 2)"
      },
      {
        name: "category",
        type: "Text"
      },
      {
        name: "template_image",
        type: "Text"
      },
      {
        name: "is_custom_template",
        type: "Boolean",
        required: true,
        defaultValue: "TRUE"
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
    name: "suppliers",
    description: "Поставщики материалов и комплектующих",
    fields: [
      {
        name: "supplier_id",
        type: "Serial",
        required: true
      },
      {
        name: "supplier_name",
        type: "Text",
        required: true
      },
      {
        name: "contact_person",
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
        name: "website",
        type: "Text"
      },
      {
        name: "terms",
        type: "Text"
      },
      {
        name: "product_categories",
        type: "Text"
      },
      {
        name: "creation_date",
        type: "Timestamp with time zone",
        required: true,
        defaultValue: "NOW()"
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
    name: "tasks",
    description: "Задачи сотрудников",
    fields: [
      {
        name: "task_id",
        type: "Serial",
        required: true
      },
      {
        name: "task_name",
        type: "Text",
        required: true
      },
      {
        name: "task_type",
        type: "Text",
        options: [
          "Звонок",
          "Встреча",
          "Замер",
          "Подготовка КП",
          "Дизайн",
          "Монтаж",
          "Другое"
        ]
      },
      {
        name: "task_status",
        type: "Text",
        required: true,
        defaultValue: "'Новая'",
        options: [
          "Новая",
          "В работе",
          "Ожидает",
          "Выполнена",
          "Отменена"
        ]
      },
      {
        name: "due_date",
        type: "Timestamp with time zone"
      },
      {
        name: "assigned_task_user_id",
        type: "UUID",
        required: true,
        reference: {
          table: "profiles",
          field: "id"
        }
      },
      {
        name: "priority",
        type: "Text",
        defaultValue: "'Средний'",
        options: [
          "Низкий",
          "Средний",
          "Высокий",
          "Срочно"
        ]
      },
      {
        name: "description",
        type: "Text"
      },
      {
        name: "related_lead_id",
        type: "Integer",
        reference: {
          table: "leads",
          field: "lead_id"
        }
      },
      {
        name: "related_contact_id",
        type: "Integer",
        reference: {
          table: "contacts",
          field: "contact_id"
        }
      },
      {
        name: "related_deal_order_id",
        type: "Integer",
        reference: {
          table: "deals_orders",
          field: "deal_order_id"
        }
      },
      {
        name: "related_partner_manufacturer_id",
        type: "Integer",
        reference: {
          table: "partners_manufacturers",
          field: "partner_manufacturer_id"
        }
      },
      {
        name: "related_custom_request_id",
        type: "Integer",
        reference: {
          table: "custom_requests",
          field: "custom_request_id"
        }
      },
      {
        name: "creation_date",
        type: "Timestamp with time zone",
        required: true,
        defaultValue: "NOW()"
      },
      {
        name: "completion_date",
        type: "Timestamp with time zone"
      },
      {
        name: "google_calendar_event_id",
        type: "Text"
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
