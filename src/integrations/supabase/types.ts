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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      brands: {
        Row: {
          company_name: string
          created_at: string
          default_base_pay: number | null
          default_currency: string
          id: string
          industry: string | null
          performance_multiplier: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          default_base_pay?: number | null
          default_currency?: string
          id?: string
          industry?: string | null
          performance_multiplier?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          default_base_pay?: number | null
          default_currency?: string
          id?: string
          industry?: string | null
          performance_multiplier?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaign_creators: {
        Row: {
          base_pay: number | null
          campaign_id: string
          created_at: string
          creator_id: string
          id: string
          status: string
          total_earned: number | null
          updated_at: string
        }
        Insert: {
          base_pay?: number | null
          campaign_id: string
          created_at?: string
          creator_id: string
          id?: string
          status?: string
          total_earned?: number | null
          updated_at?: string
        }
        Update: {
          base_pay?: number | null
          campaign_id?: string
          created_at?: string
          creator_id?: string
          id?: string
          status?: string
          total_earned?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_creators_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_creators_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand_id: string
          budget: number
          content_type: string | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          payroll_formula: Json | null
          platforms: string[]
          spent: number
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          target_audience: Json | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          budget?: number
          content_type?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          payroll_formula?: Json | null
          platforms?: string[]
          spent?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_audience?: Json | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          budget?: number
          content_type?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          payroll_formula?: Json | null
          platforms?: string[]
          spent?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_audience?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_content: {
        Row: {
          audience_match_score: number | null
          campaign_creator_id: string
          comments: number | null
          completion_rate: number | null
          content_url: string | null
          conversion_rate: number | null
          created_at: string
          ctr: number | null
          id: string
          likes: number | null
          performance_score: number | null
          platform: string
          saves: number | null
          shares: number | null
          views: number | null
          watch_time_pct: number | null
        }
        Insert: {
          audience_match_score?: number | null
          campaign_creator_id: string
          comments?: number | null
          completion_rate?: number | null
          content_url?: string | null
          conversion_rate?: number | null
          created_at?: string
          ctr?: number | null
          id?: string
          likes?: number | null
          performance_score?: number | null
          platform: string
          saves?: number | null
          shares?: number | null
          views?: number | null
          watch_time_pct?: number | null
        }
        Update: {
          audience_match_score?: number | null
          campaign_creator_id?: string
          comments?: number | null
          completion_rate?: number | null
          content_url?: string | null
          conversion_rate?: number | null
          created_at?: string
          ctr?: number | null
          id?: string
          likes?: number | null
          performance_score?: number | null
          platform?: string
          saves?: number | null
          shares?: number | null
          views?: number | null
          watch_time_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_content_campaign_creator_id_fkey"
            columns: ["campaign_creator_id"]
            isOneToOne: false
            referencedRelation: "campaign_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          audience_demographics: Json | null
          avg_engagement_rate: number | null
          category: string | null
          created_at: string
          follower_count: number | null
          fraud_risk_score: number | null
          handle: string
          id: string
          name: string
          platforms: string[]
          updated_at: string
        }
        Insert: {
          audience_demographics?: Json | null
          avg_engagement_rate?: number | null
          category?: string | null
          created_at?: string
          follower_count?: number | null
          fraud_risk_score?: number | null
          handle: string
          id?: string
          name: string
          platforms?: string[]
          updated_at?: string
        }
        Update: {
          audience_demographics?: Json | null
          avg_engagement_rate?: number | null
          category?: string | null
          created_at?: string
          follower_count?: number | null
          fraud_risk_score?: number | null
          handle?: string
          id?: string
          name?: string
          platforms?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      payroll: {
        Row: {
          base_pay: number
          bonus: number
          campaign_creator_id: string
          content_id: string | null
          created_at: string
          currency: string
          id: string
          match_score: number
          multiplier: number
          paid_at: string | null
          perf_score: number
          status: Database["public"]["Enums"]["payout_status"]
          total_payment: number
        }
        Insert: {
          base_pay?: number
          bonus?: number
          campaign_creator_id: string
          content_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          match_score?: number
          multiplier?: number
          paid_at?: string | null
          perf_score?: number
          status?: Database["public"]["Enums"]["payout_status"]
          total_payment?: number
        }
        Update: {
          base_pay?: number
          bonus?: number
          campaign_creator_id?: string
          content_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          match_score?: number
          multiplier?: number
          paid_at?: string | null
          perf_score?: number
          status?: Database["public"]["Enums"]["payout_status"]
          total_payment?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_campaign_creator_id_fkey"
            columns: ["campaign_creator_id"]
            isOneToOne: false
            referencedRelation: "campaign_creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "creator_content"
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
      campaign_status: "draft" | "active" | "paused" | "completed"
      payout_status: "pending" | "processing" | "paid" | "failed" | "flagged"
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
      campaign_status: ["draft", "active", "paused", "completed"],
      payout_status: ["pending", "processing", "paid", "failed", "flagged"],
    },
  },
} as const
