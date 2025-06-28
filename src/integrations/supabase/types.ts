export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          address: string | null
          company_id: number
          company_name: string
          creation_date: string
          email: string | null
          industry: string | null
          nif_cif: string | null
          notes: string | null
          owner_user_id: string | null
          phone: string | null
        }
        Insert: {
          address?: string | null
          company_id?: number
          company_name: string
          creation_date?: string
          email?: string | null
          industry?: string | null
          nif_cif?: string | null
          notes?: string | null
          owner_user_id?: string | null
          phone?: string | null
        }
        Update: {
          address?: string | null
          company_id?: number
          company_name?: string
          creation_date?: string
          email?: string | null
          industry?: string | null
          nif_cif?: string | null
          notes?: string | null
          owner_user_id?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          associated_company_id: number | null
          attached_files_general: Json | null
          contact_id: number
          creation_date: string
          delivery_address_apartment: string | null
          delivery_address_city: string | null
          delivery_address_country: string | null
          delivery_address_number: string | null
          delivery_address_postal_code: string | null
          delivery_address_street: string | null
          full_name: string
          nie: string | null
          notes: string | null
          owner_user_id: string | null
          primary_email: string | null
          primary_phone: string | null
          secondary_email: string | null
          secondary_phone: string | null
        }
        Insert: {
          associated_company_id?: number | null
          attached_files_general?: Json | null
          contact_id?: number
          creation_date?: string
          delivery_address_apartment?: string | null
          delivery_address_city?: string | null
          delivery_address_country?: string | null
          delivery_address_number?: string | null
          delivery_address_postal_code?: string | null
          delivery_address_street?: string | null
          full_name: string
          nie?: string | null
          notes?: string | null
          owner_user_id?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          secondary_email?: string | null
          secondary_phone?: string | null
        }
        Update: {
          associated_company_id?: number | null
          attached_files_general?: Json | null
          contact_id?: number
          creation_date?: string
          delivery_address_apartment?: string | null
          delivery_address_city?: string | null
          delivery_address_country?: string | null
          delivery_address_number?: string | null
          delivery_address_postal_code?: string | null
          delivery_address_street?: string | null
          full_name?: string
          nie?: string | null
          notes?: string | null
          owner_user_id?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          secondary_email?: string | null
          secondary_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_associated_company_id_fkey"
            columns: ["associated_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "contacts_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_requests: {
        Row: {
          assigned_user_id: string | null
          associated_company_id: number | null
          associated_contact_id: number | null
          attached_files_sketch: Json | null
          client_description: string | null
          creation_date: string
          creator_user_id: string | null
          custom_request_id: number
          desired_completion_date: string | null
          desired_materials: string | null
          estimated_dimensions: string | null
          linked_order_id: number | null
          preliminary_cost: number | null
          request_name: string | null
          request_status: string | null
        }
        Insert: {
          assigned_user_id?: string | null
          associated_company_id?: number | null
          associated_contact_id?: number | null
          attached_files_sketch?: Json | null
          client_description?: string | null
          creation_date?: string
          creator_user_id?: string | null
          custom_request_id?: number
          desired_completion_date?: string | null
          desired_materials?: string | null
          estimated_dimensions?: string | null
          linked_order_id?: number | null
          preliminary_cost?: number | null
          request_name?: string | null
          request_status?: string | null
        }
        Update: {
          assigned_user_id?: string | null
          associated_company_id?: number | null
          associated_contact_id?: number | null
          attached_files_sketch?: Json | null
          client_description?: string | null
          creation_date?: string
          creator_user_id?: string | null
          custom_request_id?: number
          desired_completion_date?: string | null
          desired_materials?: string | null
          estimated_dimensions?: string | null
          linked_order_id?: number | null
          preliminary_cost?: number | null
          request_name?: string | null
          request_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_requests_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_requests_associated_company_id_fkey"
            columns: ["associated_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "custom_requests_associated_contact_id_fkey"
            columns: ["associated_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "custom_requests_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_requests_linked_order_id_fkey"
            columns: ["linked_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      deals_orders: {
        Row: {
          assigned_user_id: string | null
          associated_company_id: number | null
          associated_contact_id: number
          associated_partner_manufacturer_id: number | null
          attached_files_order_docs: Json | null
          client_language: string
          closing_date: string | null
          creation_date: string
          creator_user_id: string | null
          deal_order_id: number
          delivery_address_full: string | null
          final_amount: number | null
          notes_history: string | null
          order_name: string | null
          order_number: string
          order_type: string
          payment_status: string | null
          source_lead_id: number | null
          status_custom_made: string | null
          status_ready_made: string | null
        }
        Insert: {
          assigned_user_id?: string | null
          associated_company_id?: number | null
          associated_contact_id: number
          associated_partner_manufacturer_id?: number | null
          attached_files_order_docs?: Json | null
          client_language: string
          closing_date?: string | null
          creation_date?: string
          creator_user_id?: string | null
          deal_order_id?: number
          delivery_address_full?: string | null
          final_amount?: number | null
          notes_history?: string | null
          order_name?: string | null
          order_number: string
          order_type: string
          payment_status?: string | null
          source_lead_id?: number | null
          status_custom_made?: string | null
          status_ready_made?: string | null
        }
        Update: {
          assigned_user_id?: string | null
          associated_company_id?: number | null
          associated_contact_id?: number
          associated_partner_manufacturer_id?: number | null
          attached_files_order_docs?: Json | null
          client_language?: string
          closing_date?: string | null
          creation_date?: string
          creator_user_id?: string | null
          deal_order_id?: number
          delivery_address_full?: string | null
          final_amount?: number | null
          notes_history?: string | null
          order_name?: string | null
          order_number?: string
          order_type?: string
          payment_status?: string | null
          source_lead_id?: number | null
          status_custom_made?: string | null
          status_ready_made?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_orders_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_orders_associated_company_id_fkey"
            columns: ["associated_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "deals_orders_associated_contact_id_fkey"
            columns: ["associated_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "deals_orders_associated_partner_manufacturer_id_fkey"
            columns: ["associated_partner_manufacturer_id"]
            isOneToOne: false
            referencedRelation: "partners_manufacturers"
            referencedColumns: ["partner_manufacturer_id"]
          },
          {
            foreignKeyName: "deals_orders_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_orders_source_lead_id_fkey"
            columns: ["source_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["lead_id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_user_id: string | null
          attached_files: Json | null
          client_language: string | null
          creation_date: string
          creator_user_id: string | null
          email: string | null
          initial_comment: string | null
          lead_id: number
          lead_source: string | null
          lead_status: string | null
          name: string | null
          phone: string | null
        }
        Insert: {
          assigned_user_id?: string | null
          attached_files?: Json | null
          client_language?: string | null
          creation_date?: string
          creator_user_id?: string | null
          email?: string | null
          initial_comment?: string | null
          lead_id?: number
          lead_source?: string | null
          lead_status?: string | null
          name?: string | null
          phone?: string | null
        }
        Update: {
          assigned_user_id?: string | null
          attached_files?: Json | null
          client_language?: string | null
          creation_date?: string
          creator_user_id?: string | null
          email?: string | null
          initial_comment?: string | null
          lead_id?: number
          lead_source?: string | null
          lead_status?: string | null
          name?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          related_entity_id: number | null
          related_entity_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          related_entity_id?: number | null
          related_entity_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          related_entity_id?: number | null
          related_entity_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          link_to_product_on_tilda: string | null
          order_item_id: number
          parent_order_id: number
          price_per_item_from_tilda: number
          product_name_from_tilda: string
          quantity: number
          sku_from_tilda: string | null
          total_item_price: number
        }
        Insert: {
          link_to_product_on_tilda?: string | null
          order_item_id?: number
          parent_order_id: number
          price_per_item_from_tilda: number
          product_name_from_tilda: string
          quantity?: number
          sku_from_tilda?: string | null
          total_item_price: number
        }
        Update: {
          link_to_product_on_tilda?: string | null
          order_item_id?: number
          parent_order_id?: number
          price_per_item_from_tilda?: number
          product_name_from_tilda?: string
          quantity?: number
          sku_from_tilda?: string | null
          total_item_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_parent_order_id_fkey"
            columns: ["parent_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_user_id: string | null
          attached_files_order_docs: Json | null
          client_company_id: number | null
          client_contact_id: number | null
          client_language: string
          closing_date: string | null
          created_at: string
          creator_user_id: string
          delivery_address_full: string | null
          final_amount: number | null
          id: number
          notes_history: string | null
          order_name: string | null
          order_number: string
          order_type: string
          partial_payment_amount: number | null
          partner_manufacturer_id: number | null
          payment_status: string | null
          source_lead_id: number | null
          status: string
        }
        Insert: {
          assigned_user_id?: string | null
          attached_files_order_docs?: Json | null
          client_company_id?: number | null
          client_contact_id?: number | null
          client_language: string
          closing_date?: string | null
          created_at?: string
          creator_user_id: string
          delivery_address_full?: string | null
          final_amount?: number | null
          id?: number
          notes_history?: string | null
          order_name?: string | null
          order_number: string
          order_type: string
          partial_payment_amount?: number | null
          partner_manufacturer_id?: number | null
          payment_status?: string | null
          source_lead_id?: number | null
          status: string
        }
        Update: {
          assigned_user_id?: string | null
          attached_files_order_docs?: Json | null
          client_company_id?: number | null
          client_contact_id?: number | null
          client_language?: string
          closing_date?: string | null
          created_at?: string
          creator_user_id?: string
          delivery_address_full?: string | null
          final_amount?: number | null
          id?: number
          notes_history?: string | null
          order_name?: string | null
          order_number?: string
          order_type?: string
          partial_payment_amount?: number | null
          partner_manufacturer_id?: number | null
          payment_status?: string | null
          source_lead_id?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_company_id_fkey"
            columns: ["client_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "orders_client_contact_id_fkey"
            columns: ["client_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "orders_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_partner_manufacturer_id_fkey"
            columns: ["partner_manufacturer_id"]
            isOneToOne: false
            referencedRelation: "partners_manufacturers"
            referencedColumns: ["partner_manufacturer_id"]
          },
          {
            foreignKeyName: "orders_source_lead_id_fkey"
            columns: ["source_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["lead_id"]
          },
        ]
      }
      partners_manufacturers: {
        Row: {
          attached_files_partner_docs: Json | null
          company_name: string
          contact_person: string | null
          creation_date: string
          creator_user_id: string | null
          email: string | null
          notes: string | null
          partner_manufacturer_id: number
          phone: string | null
          requisites: string | null
          specialization: string | null
          terms: string | null
          website: string | null
        }
        Insert: {
          attached_files_partner_docs?: Json | null
          company_name: string
          contact_person?: string | null
          creation_date?: string
          creator_user_id?: string | null
          email?: string | null
          notes?: string | null
          partner_manufacturer_id?: number
          phone?: string | null
          requisites?: string | null
          specialization?: string | null
          terms?: string | null
          website?: string | null
        }
        Update: {
          attached_files_partner_docs?: Json | null
          company_name?: string
          contact_person?: string | null
          creation_date?: string
          creator_user_id?: string | null
          email?: string | null
          notes?: string | null
          partner_manufacturer_id?: number
          phone?: string | null
          requisites?: string | null
          specialization?: string | null
          terms?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_manufacturers_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number | null
          category: string | null
          creation_date: string
          creator_user_id: string | null
          description: string | null
          internal_product_name: string
          internal_sku: string | null
          is_custom_template: boolean
          notes: string | null
          product_id: number
          template_image: string | null
        }
        Insert: {
          base_price?: number | null
          category?: string | null
          creation_date?: string
          creator_user_id?: string | null
          description?: string | null
          internal_product_name: string
          internal_sku?: string | null
          is_custom_template?: boolean
          notes?: string | null
          product_id?: number
          template_image?: string | null
        }
        Update: {
          base_price?: number | null
          category?: string | null
          creation_date?: string
          creator_user_id?: string | null
          description?: string | null
          internal_product_name?: string
          internal_sku?: string | null
          is_custom_template?: boolean
          notes?: string | null
          product_id?: number
          template_image?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          registration_date: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          registration_date?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          registration_date?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          attached_files: Json | null
          contact_person: string | null
          creation_date: string
          creator_user_id: string | null
          email: string | null
          phone: string | null
          product_categories: string | null
          supplier_id: number
          supplier_name: string
          terms: string | null
          website: string | null
        }
        Insert: {
          attached_files?: Json | null
          contact_person?: string | null
          creation_date?: string
          creator_user_id?: string | null
          email?: string | null
          phone?: string | null
          product_categories?: string | null
          supplier_id?: number
          supplier_name: string
          terms?: string | null
          website?: string | null
        }
        Update: {
          attached_files?: Json | null
          contact_person?: string | null
          creation_date?: string
          creator_user_id?: string | null
          email?: string | null
          phone?: string | null
          product_categories?: string | null
          supplier_id?: number
          supplier_name?: string
          terms?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_task_user_id: string
          completion_date: string | null
          creation_date: string
          creator_user_id: string | null
          description: string | null
          due_date: string | null
          google_calendar_event_id: string | null
          priority: string | null
          related_contact_id: number | null
          related_custom_request_id: number | null
          related_lead_id: number | null
          related_order_id: number | null
          related_partner_manufacturer_id: number | null
          task_id: number
          task_name: string
          task_status: string
          task_type: string | null
        }
        Insert: {
          assigned_task_user_id: string
          completion_date?: string | null
          creation_date?: string
          creator_user_id?: string | null
          description?: string | null
          due_date?: string | null
          google_calendar_event_id?: string | null
          priority?: string | null
          related_contact_id?: number | null
          related_custom_request_id?: number | null
          related_lead_id?: number | null
          related_order_id?: number | null
          related_partner_manufacturer_id?: number | null
          task_id?: number
          task_name: string
          task_status?: string
          task_type?: string | null
        }
        Update: {
          assigned_task_user_id?: string
          completion_date?: string | null
          creation_date?: string
          creator_user_id?: string | null
          description?: string | null
          due_date?: string | null
          google_calendar_event_id?: string | null
          priority?: string | null
          related_contact_id?: number | null
          related_custom_request_id?: number | null
          related_lead_id?: number | null
          related_order_id?: number | null
          related_partner_manufacturer_id?: number | null
          task_id?: number
          task_name?: string
          task_status?: string
          task_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_task_user_id_fkey"
            columns: ["assigned_task_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_contact_id_fkey"
            columns: ["related_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "tasks_related_custom_request_id_fkey"
            columns: ["related_custom_request_id"]
            isOneToOne: false
            referencedRelation: "custom_requests"
            referencedColumns: ["custom_request_id"]
          },
          {
            foreignKeyName: "tasks_related_lead_id_fkey"
            columns: ["related_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "tasks_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_partner_manufacturer_id_fkey"
            columns: ["related_partner_manufacturer_id"]
            isOneToOne: false
            referencedRelation: "partners_manufacturers"
            referencedColumns: ["partner_manufacturer_id"]
          },
        ]
      }
      transaction_categories: {
        Row: {
          created_at: string
          creator_user_id: string
          description: string | null
          id: number
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_user_id: string
          description?: string | null
          id?: number
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_user_id?: string
          description?: string | null
          id?: number
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_categories_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          attached_files: Json | null
          category_id: number
          created_at: string
          creator_user_id: string
          currency: string
          description: string | null
          id: string
          payment_method: string | null
          related_contact_id: number | null
          related_order_id: number | null
          related_partner_manufacturer_id: number | null
          related_supplier_id: number | null
          related_user_id: string | null
          transaction_date: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          attached_files?: Json | null
          category_id: number
          created_at?: string
          creator_user_id: string
          currency?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          related_contact_id?: number | null
          related_order_id?: number | null
          related_partner_manufacturer_id?: number | null
          related_supplier_id?: number | null
          related_user_id?: string | null
          transaction_date: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          attached_files?: Json | null
          category_id?: number
          created_at?: string
          creator_user_id?: string
          currency?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          related_contact_id?: number | null
          related_order_id?: number | null
          related_partner_manufacturer_id?: number | null
          related_supplier_id?: number | null
          related_user_id?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_related_contact_id_fkey"
            columns: ["related_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "transactions_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_related_partner_manufacturer_id_fkey"
            columns: ["related_partner_manufacturer_id"]
            isOneToOne: false
            referencedRelation: "partners_manufacturers"
            referencedColumns: ["partner_manufacturer_id"]
          },
          {
            foreignKeyName: "transactions_related_supplier_id_fkey"
            columns: ["related_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["supplier_id"]
          },
          {
            foreignKeyName: "transactions_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_notification: {
        Args: {
          p_user_id: string
          p_title: string
          p_message: string
          p_type?: string
          p_related_entity_type?: string
          p_related_entity_id?: number
          p_action_url?: string
        }
        Returns: string
      }
      delete_old_read_notifications: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      generate_new_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_distinct_values: {
        Args: { table_name: string; column_name: string }
        Returns: {
          value: string
        }[]
      }
      get_financial_summary: {
        Args: { date_from: string; date_to: string }
        Returns: Json
      }
      get_sorted_tasks: {
        Args: Record<PropertyKey, never>
        Returns: {
          task_id: number
          task_name: string
          description: string
          task_type: string
          task_status: string
          priority: string
          creation_date: string
          due_date: string
          completion_date: string
          creator_user_id: string
          assigned_task_user_id: string
          google_calendar_event_id: string
          related_lead_id: number
          related_contact_id: number
          related_order_id: number
          related_custom_request_id: number
          related_partner_manufacturer_id: number
          assigned_user_name: string
          creator_user_name: string
        }[]
      }
      get_task_related_details: {
        Args: { p_task_id: number; p_user_id: string }
        Returns: Json
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role:
        | "Главный Администратор"
        | "Администратор"
        | "Менеджер"
        | "Замерщик"
        | "Дизайнер"
        | "Монтажник"
        | "Специалист"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: [
        "Главный Администратор",
        "Администратор",
        "Менеджер",
        "Замерщик",
        "Дизайнер",
        "Монтажник",
        "Специалист",
      ],
    },
  },
} as const
