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
      leads: {
        Row: {
          assigned_user_id: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string
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
      ],
    },
  },
} as const
