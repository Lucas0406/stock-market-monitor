export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      monitored_stocks: {
        Row: {
          id: string;
          user_id: string;
          user_email: string;
          ticker: string;
          company_name: string | null;
          target_min_price: number | null;
          target_max_price: number | null;
          is_active: boolean;
          last_notified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_email: string;
          ticker: string;
          company_name?: string | null;
          target_min_price?: number | null;
          target_max_price?: number | null;
          is_active?: boolean;
          last_notified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_email?: string;
          ticker?: string;
          company_name?: string | null;
          target_min_price?: number | null;
          target_max_price?: number | null;
          is_active?: boolean;
          last_notified_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "monitored_stocks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_settings: {
        Row: {
          user_id: string;
          resend_api_key: string | null;
          schedule_preset: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          resend_api_key?: string | null;
          schedule_preset?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          resend_api_key?: string | null;
          schedule_preset?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type MonitoredStock = Database["public"]["Tables"]["monitored_stocks"]["Row"];
export type UserSetting = Database["public"]["Tables"]["user_settings"]["Row"];
