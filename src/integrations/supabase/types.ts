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
      brand_creator_ratings: {
        Row: {
          brand_id: string
          campaign_id: string | null
          communication_rating: number | null
          content_quality_rating: number | null
          created_at: string
          creator_id: string
          delivery_rating: number | null
          id: string
          overall_rating: number
          professionalism_rating: number | null
          review_text: string | null
        }
        Insert: {
          brand_id: string
          campaign_id?: string | null
          communication_rating?: number | null
          content_quality_rating?: number | null
          created_at?: string
          creator_id: string
          delivery_rating?: number | null
          id?: string
          overall_rating: number
          professionalism_rating?: number | null
          review_text?: string | null
        }
        Update: {
          brand_id?: string
          campaign_id?: string | null
          communication_rating?: number | null
          content_quality_rating?: number | null
          created_at?: string
          creator_id?: string
          delivery_rating?: number | null
          id?: string
          overall_rating?: number
          professionalism_rating?: number | null
          review_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_creator_ratings_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_creator_ratings_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_creator_ratings_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
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
      campaign_automations: {
        Row: {
          automation_type: string
          brand_id: string
          campaign_id: string
          config: Json | null
          created_at: string
          id: string
          last_run_at: string | null
          results: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          automation_type?: string
          brand_id: string
          campaign_id: string
          config?: Json | null
          created_at?: string
          id?: string
          last_run_at?: string | null
          results?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          automation_type?: string
          brand_id?: string
          campaign_id?: string
          config?: Json | null
          created_at?: string
          id?: string
          last_run_at?: string | null
          results?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_automations_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_automations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
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
      campaign_escrow: {
        Row: {
          amount: number
          campaign_id: string
          created_at: string
          currency: string
          funded_at: string | null
          id: string
          notes: string | null
          released_amount: number | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          campaign_id: string
          created_at?: string
          currency?: string
          funded_at?: string | null
          id?: string
          notes?: string | null
          released_amount?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          campaign_id?: string
          created_at?: string
          currency?: string
          funded_at?: string | null
          id?: string
          notes?: string | null
          released_amount?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_escrow_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand_id: string
          budget: number
          content_type: string | null
          cpa: number | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          payroll_formula: Json | null
          platforms: string[]
          roas: number | null
          spent: number
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          target_audience: Json | null
          total_conversions: number | null
          total_revenue: number | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          budget?: number
          content_type?: string | null
          cpa?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          payroll_formula?: Json | null
          platforms?: string[]
          roas?: number | null
          spent?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_audience?: Json | null
          total_conversions?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          budget?: number
          content_type?: string | null
          cpa?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          payroll_formula?: Json | null
          platforms?: string[]
          roas?: number | null
          spent?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_audience?: Json | null
          total_conversions?: number | null
          total_revenue?: number | null
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
      content_analysis: {
        Row: {
          ad_compliance_score: number | null
          analyzed_at: string
          brand_exposure_score: number | null
          brand_logo_seconds: number | null
          brand_safety_score: number | null
          content_id: string
          content_quality_score: number | null
          id: string
          key_findings: Json | null
          model_used: string | null
          product_visibility: boolean | null
          sentiment_score: number | null
          verbal_mentions: number | null
        }
        Insert: {
          ad_compliance_score?: number | null
          analyzed_at?: string
          brand_exposure_score?: number | null
          brand_logo_seconds?: number | null
          brand_safety_score?: number | null
          content_id: string
          content_quality_score?: number | null
          id?: string
          key_findings?: Json | null
          model_used?: string | null
          product_visibility?: boolean | null
          sentiment_score?: number | null
          verbal_mentions?: number | null
        }
        Update: {
          ad_compliance_score?: number | null
          analyzed_at?: string
          brand_exposure_score?: number | null
          brand_logo_seconds?: number | null
          brand_safety_score?: number | null
          content_id?: string
          content_quality_score?: number | null
          id?: string
          key_findings?: Json | null
          model_used?: string | null
          product_visibility?: boolean | null
          sentiment_score?: number | null
          verbal_mentions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_analysis_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "creator_content"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_tracking: {
        Row: {
          campaign_id: string
          clicks: number | null
          conversions: number | null
          created_at: string
          creator_id: string | null
          id: string
          revenue: number | null
          signups: number | null
          tracking_code: string
          tracking_type: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          creator_id?: string | null
          id?: string
          revenue?: number | null
          signups?: number | null
          tracking_code: string
          tracking_type?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          creator_id?: string | null
          id?: string
          revenue?: number | null
          signups?: number | null
          tracking_code?: string
          tracking_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversion_tracking_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversion_tracking_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
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
          fraud_indicators: Json | null
          fraud_risk_score: number | null
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
          fraud_indicators?: Json | null
          fraud_risk_score?: number | null
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
          fraud_indicators?: Json | null
          fraud_risk_score?: number | null
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
      creator_contracts: {
        Row: {
          base_pay: number | null
          bonus_structure: Json | null
          brand_id: string
          brand_signature: string | null
          campaign_id: string
          contract_number: string
          created_at: string
          creator_id: string
          creator_signature: string | null
          deliverables: Json | null
          end_date: string | null
          id: string
          payment_milestones: Json | null
          signed_by_brand: boolean | null
          signed_by_brand_at: string | null
          signed_by_creator: boolean | null
          signed_by_creator_at: string | null
          start_date: string | null
          status: string
          terms: string | null
          updated_at: string
        }
        Insert: {
          base_pay?: number | null
          bonus_structure?: Json | null
          brand_id: string
          brand_signature?: string | null
          campaign_id: string
          contract_number: string
          created_at?: string
          creator_id: string
          creator_signature?: string | null
          deliverables?: Json | null
          end_date?: string | null
          id?: string
          payment_milestones?: Json | null
          signed_by_brand?: boolean | null
          signed_by_brand_at?: string | null
          signed_by_creator?: boolean | null
          signed_by_creator_at?: string | null
          start_date?: string | null
          status?: string
          terms?: string | null
          updated_at?: string
        }
        Update: {
          base_pay?: number | null
          bonus_structure?: Json | null
          brand_id?: string
          brand_signature?: string | null
          campaign_id?: string
          contract_number?: string
          created_at?: string
          creator_id?: string
          creator_signature?: string | null
          deliverables?: Json | null
          end_date?: string | null
          id?: string
          payment_milestones?: Json | null
          signed_by_brand?: boolean | null
          signed_by_brand_at?: string | null
          signed_by_creator?: boolean | null
          signed_by_creator_at?: string | null
          start_date?: string | null
          status?: string
          terms?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_contracts_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_contracts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_contracts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_payment_profiles: {
        Row: {
          bank_account_number: string | null
          bank_country: string | null
          bank_name: string | null
          bank_routing_number: string | null
          created_at: string
          creator_id: string
          id: string
          payment_method: string
          paypal_email: string | null
          preferred_currency: string
          tax_form_submitted_at: string | null
          tax_form_type: string | null
          tax_form_verified: boolean | null
          tax_id_last_four: string | null
          updated_at: string
          wise_email: string | null
        }
        Insert: {
          bank_account_number?: string | null
          bank_country?: string | null
          bank_name?: string | null
          bank_routing_number?: string | null
          created_at?: string
          creator_id: string
          id?: string
          payment_method?: string
          paypal_email?: string | null
          preferred_currency?: string
          tax_form_submitted_at?: string | null
          tax_form_type?: string | null
          tax_form_verified?: boolean | null
          tax_id_last_four?: string | null
          updated_at?: string
          wise_email?: string | null
        }
        Update: {
          bank_account_number?: string | null
          bank_country?: string | null
          bank_name?: string | null
          bank_routing_number?: string | null
          created_at?: string
          creator_id?: string
          id?: string
          payment_method?: string
          paypal_email?: string | null
          preferred_currency?: string
          tax_form_submitted_at?: string | null
          tax_form_type?: string | null
          tax_form_verified?: boolean | null
          tax_id_last_four?: string | null
          updated_at?: string
          wise_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_payment_profiles_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_tax_documents: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          business_name: string | null
          city: string | null
          country: string | null
          created_at: string
          creator_id: string
          document_type: string
          ein_last_four: string | null
          foreign_tax_id: string | null
          id: string
          legal_name: string | null
          signature_data: string | null
          signed_at: string | null
          ssn_last_four: string | null
          state: string | null
          storage_path: string | null
          tax_classification: string | null
          tax_year: number | null
          verified_at: string | null
          verified_by: string | null
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          business_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          creator_id: string
          document_type: string
          ein_last_four?: string | null
          foreign_tax_id?: string | null
          id?: string
          legal_name?: string | null
          signature_data?: string | null
          signed_at?: string | null
          ssn_last_four?: string | null
          state?: string | null
          storage_path?: string | null
          tax_classification?: string | null
          tax_year?: number | null
          verified_at?: string | null
          verified_by?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          business_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          creator_id?: string
          document_type?: string
          ein_last_four?: string | null
          foreign_tax_id?: string | null
          id?: string
          legal_name?: string | null
          signature_data?: string | null
          signed_at?: string | null
          ssn_last_four?: string | null
          state?: string | null
          storage_path?: string | null
          tax_classification?: string | null
          tax_year?: number | null
          verified_at?: string | null
          verified_by?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_tax_documents_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          audience_authenticity: number | null
          audience_demographics: Json | null
          avg_engagement_rate: number | null
          bio: string | null
          category: string | null
          contract_completion_rate: number | null
          created_at: string
          delivery_reliability: number | null
          disputes: number | null
          follower_count: number | null
          fraud_indicators: Json | null
          fraud_risk_score: number | null
          handle: string
          id: string
          is_marketplace_listed: boolean | null
          languages: string[] | null
          last_fraud_scan: string | null
          location: string | null
          name: string
          platforms: string[]
          portfolio_urls: string[] | null
          price_range_max: number | null
          price_range_min: number | null
          total_campaigns_completed: number | null
          trust_score: number | null
          updated_at: string
        }
        Insert: {
          audience_authenticity?: number | null
          audience_demographics?: Json | null
          avg_engagement_rate?: number | null
          bio?: string | null
          category?: string | null
          contract_completion_rate?: number | null
          created_at?: string
          delivery_reliability?: number | null
          disputes?: number | null
          follower_count?: number | null
          fraud_indicators?: Json | null
          fraud_risk_score?: number | null
          handle: string
          id?: string
          is_marketplace_listed?: boolean | null
          languages?: string[] | null
          last_fraud_scan?: string | null
          location?: string | null
          name: string
          platforms?: string[]
          portfolio_urls?: string[] | null
          price_range_max?: number | null
          price_range_min?: number | null
          total_campaigns_completed?: number | null
          trust_score?: number | null
          updated_at?: string
        }
        Update: {
          audience_authenticity?: number | null
          audience_demographics?: Json | null
          avg_engagement_rate?: number | null
          bio?: string | null
          category?: string | null
          contract_completion_rate?: number | null
          created_at?: string
          delivery_reliability?: number | null
          disputes?: number | null
          follower_count?: number | null
          fraud_indicators?: Json | null
          fraud_risk_score?: number | null
          handle?: string
          id?: string
          is_marketplace_listed?: boolean | null
          languages?: string[] | null
          last_fraud_scan?: string | null
          location?: string | null
          name?: string
          platforms?: string[]
          portfolio_urls?: string[] | null
          price_range_max?: number | null
          price_range_min?: number | null
          total_campaigns_completed?: number | null
          trust_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      payout_batches: {
        Row: {
          batch_number: string
          brand_id: string
          created_at: string
          creator_count: number | null
          currency: string
          failure_count: number | null
          id: string
          notes: string | null
          payment_method: string
          paypal_batch_id: string | null
          processed_at: string | null
          scheduled_for: string | null
          status: string
          success_count: number | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          batch_number: string
          brand_id: string
          created_at?: string
          creator_count?: number | null
          currency?: string
          failure_count?: number | null
          id?: string
          notes?: string | null
          payment_method?: string
          paypal_batch_id?: string | null
          processed_at?: string | null
          scheduled_for?: string | null
          status?: string
          success_count?: number | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          batch_number?: string
          brand_id?: string
          created_at?: string
          creator_count?: number | null
          currency?: string
          failure_count?: number | null
          id?: string
          notes?: string | null
          payment_method?: string
          paypal_batch_id?: string | null
          processed_at?: string | null
          scheduled_for?: string | null
          status?: string
          success_count?: number | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_batches_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll: {
        Row: {
          base_pay: number
          batch_id: string | null
          bonus: number
          campaign_creator_id: string
          content_id: string | null
          converted_amount: number | null
          converted_currency: string | null
          created_at: string
          currency: string
          escrow_id: string | null
          id: string
          match_score: number
          multiplier: number
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          perf_score: number
          status: Database["public"]["Enums"]["payout_status"]
          total_payment: number
        }
        Insert: {
          base_pay?: number
          batch_id?: string | null
          bonus?: number
          campaign_creator_id: string
          content_id?: string | null
          converted_amount?: number | null
          converted_currency?: string | null
          created_at?: string
          currency?: string
          escrow_id?: string | null
          id?: string
          match_score?: number
          multiplier?: number
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          perf_score?: number
          status?: Database["public"]["Enums"]["payout_status"]
          total_payment?: number
        }
        Update: {
          base_pay?: number
          batch_id?: string | null
          bonus?: number
          campaign_creator_id?: string
          content_id?: string | null
          converted_amount?: number | null
          converted_currency?: string | null
          created_at?: string
          currency?: string
          escrow_id?: string | null
          id?: string
          match_score?: number
          multiplier?: number
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          perf_score?: number
          status?: Database["public"]["Enums"]["payout_status"]
          total_payment?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "payout_batches"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "payroll_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "campaign_escrow"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_alerts: {
        Row: {
          alert_type: string
          campaign_id: string | null
          content_id: string | null
          created_at: string
          creator_id: string | null
          id: string
          is_read: boolean | null
          message: string | null
          metric_name: string | null
          metric_value: number | null
          threshold: number | null
          title: string
        }
        Insert: {
          alert_type?: string
          campaign_id?: string | null
          content_id?: string | null
          created_at?: string
          creator_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metric_name?: string | null
          metric_value?: number | null
          threshold?: number | null
          title: string
        }
        Update: {
          alert_type?: string
          campaign_id?: string | null
          content_id?: string | null
          created_at?: string
          creator_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metric_name?: string | null
          metric_value?: number | null
          threshold?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_alerts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_alerts_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "creator_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_alerts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
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
