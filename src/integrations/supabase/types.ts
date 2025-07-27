export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      estimate_items: {
        Row: {
          created_at: string
          estimate_id: number
          id: number
          material_id: number
          price_at_estimation: number | null
          quantity_needed: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimate_id: number
          id?: number
          material_id: number
          price_at_estimation?: number | null
          quantity_needed: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimate_id?: number
          id?: number
          material_id?: number
          price_at_estimation?: number | null
          quantity_needed?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          created_at: string
          creator_user_id: string
          id: number
          name: string | null
          order_id: number
          status: string
          total_cost: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_user_id: string
          id?: number
          name?: string | null
          order_id: number
          status?: string
          total_cost?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_user_id?: string
          id?: number
          name?: string | null
          order_id?: number
          status?: string
          total_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimates_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
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
      locations: {
        Row: {
          address: string | null
          created_at: string
          creator_user_id: string
          description: string | null
          id: number
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          creator_user_id: string
          description?: string | null
          id?: number
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          creator_user_id?: string
          description?: string | null
          id?: number
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      material_reservations: {
        Row: {
          created_at: string
          id: number
          location: string | null
          material_id: number
          order_id: number
          quantity_reserved: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          location?: string | null
          material_id: number
          order_id: number
          quantity_reserved: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          location?: string | null
          material_id?: number
          order_id?: number
          quantity_reserved?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_reservations_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          average_cost: number | null
          barcode: string | null
          category: Database["public"]["Enums"]["material_category"]
          created_at: string
          creator_user_id: string
          current_cost: number | null
          description: string | null
          id: number
          is_active: boolean
          max_stock_level: number | null
          min_stock_level: number | null
          name: string
          sku: string | null
          supplier_id: number | null
          unit: Database["public"]["Enums"]["material_unit"]
          updated_at: string
        }
        Insert: {
          average_cost?: number | null
          barcode?: string | null
          category: Database["public"]["Enums"]["material_category"]
          created_at?: string
          creator_user_id: string
          current_cost?: number | null
          description?: string | null
          id?: number
          is_active?: boolean
          max_stock_level?: number | null
          min_stock_level?: number | null
          name: string
          sku?: string | null
          supplier_id?: number | null
          unit: Database["public"]["Enums"]["material_unit"]
          updated_at?: string
        }
        Update: {
          average_cost?: number | null
          barcode?: string | null
          category?: Database["public"]["Enums"]["material_category"]
          created_at?: string
          creator_user_id?: string
          current_cost?: number | null
          description?: string | null
          id?: number
          is_active?: boolean
          max_stock_level?: number | null
          min_stock_level?: number | null
          name?: string
          sku?: string | null
          supplier_id?: number | null
          unit?: Database["public"]["Enums"]["material_unit"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["supplier_id"]
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
      stock_levels: {
        Row: {
          available_quantity: number | null
          created_at: string
          current_quantity: number
          id: number
          last_movement_date: string | null
          location: string
          material_id: number
          notes: string | null
          reserved_quantity: number
          status: Database["public"]["Enums"]["stock_status"]
          updated_at: string
        }
        Insert: {
          available_quantity?: number | null
          created_at?: string
          current_quantity?: number
          id?: number
          last_movement_date?: string | null
          location?: string
          material_id: number
          notes?: string | null
          reserved_quantity?: number
          status?: Database["public"]["Enums"]["stock_status"]
          updated_at?: string
        }
        Update: {
          available_quantity?: number | null
          created_at?: string
          current_quantity?: number
          id?: number
          last_movement_date?: string | null
          location?: string
          material_id?: number
          notes?: string | null
          reserved_quantity?: number
          status?: Database["public"]["Enums"]["stock_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_levels_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string
          from_location: string | null
          id: number
          material_id: number
          movement_date: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes: string | null
          order_id: number | null
          quantity: number
          reference_document: string | null
          supplier_id: number | null
          to_location: string | null
          total_cost: number | null
          unit_cost: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          from_location?: string | null
          id?: number
          material_id: number
          movement_date?: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes?: string | null
          order_id?: number | null
          quantity: number
          reference_document?: string | null
          supplier_id?: number | null
          to_location?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          from_location?: string | null
          id?: number
          material_id?: number
          movement_date?: string
          movement_type?: Database["public"]["Enums"]["stock_movement_type"]
          notes?: string | null
          order_id?: number | null
          quantity?: number
          reference_document?: string | null
          supplier_id?: number | null
          to_location?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["supplier_id"]
          },
        ]
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
      suppliers_materials: {
        Row: {
          created_at: string
          id: number
          is_preferred: boolean
          lead_time_days: number | null
          material_id: number
          minimum_order_quantity: number | null
          supplier_id: number
          supplier_price: number | null
          supplier_sku: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_preferred?: boolean
          lead_time_days?: number | null
          material_id: number
          minimum_order_quantity?: number | null
          supplier_id: number
          supplier_price?: number | null
          supplier_sku?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          is_preferred?: boolean
          lead_time_days?: number | null
          material_id?: number
          minimum_order_quantity?: number | null
          supplier_id?: number
          supplier_price?: number | null
          supplier_sku?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_materials_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["supplier_id"]
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
      can_delete_stock_movement: {
        Args: { movement_id: number }
        Returns: Json
      }
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
      create_stock_movement: {
        Args: { p_movement_data: Json }
        Returns: {
          created_at: string
          created_by: string
          from_location: string | null
          id: number
          material_id: number
          movement_date: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes: string | null
          order_id: number | null
          quantity: number
          reference_document: string | null
          supplier_id: number | null
          to_location: string | null
          total_cost: number | null
          unit_cost: number | null
        }
      }
      debug_auth_state: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      delete_old_read_notifications: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      delete_stock_movement: {
        Args: { p_movement_id: number }
        Returns: Json
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
      get_movement_multiplier: {
        Args: {
          movement_type_param: Database["public"]["Enums"]["stock_movement_type"]
        }
        Returns: number
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
      recalculate_all_stock_levels: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      recalculate_one_material_stock: {
        Args: { p_material_id: number }
        Returns: undefined
      }
      recalculate_stock_for_location: {
        Args: { p_material_id: number; p_location: string }
        Returns: undefined
      }
      recalculate_stock_levels: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reserve_materials_from_estimate: {
        Args: { p_estimate_id: number }
        Returns: Json
      }
    }
    Enums: {
      material_category:
        | "Древесина"
        | "Металлы"
        | "Фурнитура"
        | "Крепеж"
        | "Клеи и герметики"
        | "Лакокрасочные материалы"
        | "Ткани и обивка"
        | "Стекло и зеркала"
        | "Инструменты"
        | "Расходные материалы"
        | "Прочие"
      material_unit:
        | "шт"
        | "м"
        | "м²"
        | "м³"
        | "кг"
        | "л"
        | "упак"
        | "комплект"
        | "рулон"
        | "лист"
      stock_movement_type:
        | "Поступление"
        | "Расход"
        | "Перемещение"
        | "Инвентаризация"
        | "Списание"
        | "Возврат"
      stock_status:
        | "В наличии"
        | "Заканчивается"
        | "Нет в наличии"
        | "Заказано у поставщика"
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      material_category: [
        "Древесина",
        "Металлы",
        "Фурнитура",
        "Крепеж",
        "Клеи и герметики",
        "Лакокрасочные материалы",
        "Ткани и обивка",
        "Стекло и зеркала",
        "Инструменты",
        "Расходные материалы",
        "Прочие",
      ],
      material_unit: [
        "шт",
        "м",
        "м²",
        "м³",
        "кг",
        "л",
        "упак",
        "комплект",
        "рулон",
        "лист",
      ],
      stock_movement_type: [
        "Поступление",
        "Расход",
        "Перемещение",
        "Инвентаризация",
        "Списание",
        "Возврат",
      ],
      stock_status: [
        "В наличии",
        "Заканчивается",
        "Нет в наличии",
        "Заказано у поставщика",
      ],
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
