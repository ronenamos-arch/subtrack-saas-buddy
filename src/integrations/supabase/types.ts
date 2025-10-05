export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      email_scan_rules: {
        Row: {
          created_at: string
          enabled: boolean | null
          id: string
          sender_filter: string | null
          subject_filter: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean | null
          id?: string
          sender_filter?: string | null
          subject_filter?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean | null
          id?: string
          sender_filter?: string | null
          subject_filter?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gmail_tokens: {
        Row: {
          access_token: string
          created_at: string
          email_address: string | null
          id: string
          refresh_token: string
          token_expiry: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          email_address?: string | null
          id?: string
          refresh_token: string
          token_expiry: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          email_address?: string | null
          id?: string
          refresh_token?: string
          token_expiry?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number | null
          billing_cycle: string | null
          billing_date: string | null
          created_at: string
          currency: string | null
          email_id: string | null
          id: string
          parsed_data: Json | null
          pdf_url: string | null
          received_date: string | null
          sender: string | null
          service_name: string | null
          status: string | null
          subject: string | null
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          billing_cycle?: string | null
          billing_date?: string | null
          created_at?: string
          currency?: string | null
          email_id?: string | null
          id?: string
          parsed_data?: Json | null
          pdf_url?: string | null
          received_date?: string | null
          sender?: string | null
          service_name?: string | null
          status?: string | null
          subject?: string | null
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          billing_cycle?: string | null
          billing_date?: string | null
          created_at?: string
          currency?: string | null
          email_id?: string | null
          id?: string
          parsed_data?: Json | null
          pdf_url?: string | null
          received_date?: string | null
          sender?: string | null
          service_name?: string | null
          status?: string | null
          subject?: string | null
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          currency: string | null
          full_name: string | null
          id: string
          notification_days: number[] | null
          organization_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          full_name?: string | null
          id: string
          notification_days?: number[] | null
          organization_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          full_name?: string | null
          id?: string
          notification_days?: number[] | null
          organization_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_suggestions: {
        Row: {
          amount: number
          billing_cycle: string
          confidence_score: number | null
          created_at: string
          currency: string | null
          duplicate_of: string | null
          id: string
          invoice_id: string | null
          next_renewal_date: string
          service_name: string
          status: string | null
          updated_at: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          amount: number
          billing_cycle: string
          confidence_score?: number | null
          created_at?: string
          currency?: string | null
          duplicate_of?: string | null
          id?: string
          invoice_id?: string | null
          next_renewal_date: string
          service_name: string
          status?: string | null
          updated_at?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          billing_cycle?: string
          confidence_score?: number | null
          created_at?: string
          currency?: string | null
          duplicate_of?: string | null
          id?: string
          invoice_id?: string | null
          next_renewal_date?: string
          service_name?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_suggestions_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_suggestions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: string
          category_id: string | null
          cost: number
          created_at: string | null
          currency: string | null
          id: string
          last_login: string | null
          licenses_count: number | null
          licenses_used: number | null
          logo_url: string | null
          next_renewal_date: string
          notes: string | null
          service_name: string
          start_date: string
          status: string | null
          updated_at: string | null
          user_id: string
          vendor: string | null
          website_url: string | null
        }
        Insert: {
          billing_cycle: string
          category_id?: string | null
          cost: number
          created_at?: string | null
          currency?: string | null
          id?: string
          last_login?: string | null
          licenses_count?: number | null
          licenses_used?: number | null
          logo_url?: string | null
          next_renewal_date: string
          notes?: string | null
          service_name: string
          start_date: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          vendor?: string | null
          website_url?: string | null
        }
        Update: {
          billing_cycle?: string
          category_id?: string | null
          cost?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          last_login?: string | null
          licenses_count?: number | null
          licenses_used?: number | null
          logo_url?: string | null
          next_renewal_date?: string
          notes?: string | null
          service_name?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          vendor?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
