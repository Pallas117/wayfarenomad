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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      emergency_beacons: {
        Row: {
          created_at: string
          id: string
          lat: number
          lng: number
          message: string | null
          resolved_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lat: number
          lng: number
          message?: string | null
          resolved_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          message?: string | null
          resolved_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string
          city: string
          created_at: string
          description: string | null
          event_date: string | null
          id: string
          lat: number | null
          lng: number | null
          pulse_rank: number | null
          source_url: string | null
          title: string
          venue: string | null
          verified: boolean | null
          verified_by: string | null
        }
        Insert: {
          category: string
          city: string
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          pulse_rank?: number | null
          source_url?: string | null
          title: string
          venue?: string | null
          verified?: boolean | null
          verified_by?: string | null
        }
        Update: {
          category?: string
          city?: string
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          pulse_rank?: number | null
          source_url?: string | null
          title?: string
          venue?: string | null
          verified?: boolean | null
          verified_by?: string | null
        }
        Relationships: []
      }
      expeditions: {
        Row: {
          cost_usd: number | null
          created_at: string
          description: string | null
          end_date: string
          host_id: string
          id: string
          lat: number | null
          lng: number | null
          location_name: string | null
          max_participants: number | null
          start_date: string
          status: string | null
          title: string
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string
          description?: string | null
          end_date: string
          host_id: string
          id?: string
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          max_participants?: number | null
          start_date: string
          status?: string | null
          title: string
        }
        Update: {
          cost_usd?: number | null
          created_at?: string
          description?: string | null
          end_date?: string
          host_id?: string
          id?: string
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          max_participants?: number | null
          start_date?: string
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      instant_meetups: {
        Row: {
          calendar_sync_status: boolean | null
          created_at: string
          id: string
          initiator_id: string
          recipient_id: string
          scheduled_time: string | null
          transit_mode: string | null
          travel_time_minutes: number | null
        }
        Insert: {
          calendar_sync_status?: boolean | null
          created_at?: string
          id?: string
          initiator_id: string
          recipient_id: string
          scheduled_time?: string | null
          transit_mode?: string | null
          travel_time_minutes?: number | null
        }
        Update: {
          calendar_sync_status?: boolean | null
          created_at?: string
          id?: string
          initiator_id?: string
          recipient_id?: string
          scheduled_time?: string | null
          transit_mode?: string | null
          travel_time_minutes?: number | null
        }
        Relationships: []
      }
      itineraries: {
        Row: {
          arrival_date: string
          city_name: string
          created_at: string
          departure_date: string
          id: string
          user_id: string
        }
        Insert: {
          arrival_date: string
          city_name: string
          created_at?: string
          departure_date: string
          id?: string
          user_id: string
        }
        Update: {
          arrival_date?: string
          city_name?: string
          created_at?: string
          departure_date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          match_type: string
          matched_user_id: string
          shared_vision_score: number | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_type: string
          matched_user_id: string
          shared_vision_score?: number | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_type?: string
          matched_user_id?: string
          shared_vision_score?: number | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          bridge: Database["public"]["Enums"]["cultural_bridge"] | null
          created_at: string
          current_city: string | null
          display_name: string | null
          encrypted_private_key: string | null
          full_name: string | null
          id: string
          learns: string[] | null
          quiz_completed: boolean | null
          stardust_points: number | null
          teaches: string[] | null
          travel_end: string | null
          travel_start: string | null
          updated_at: string
          user_id: string
          vision_completed: boolean | null
          vision_statement: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          bridge?: Database["public"]["Enums"]["cultural_bridge"] | null
          created_at?: string
          current_city?: string | null
          display_name?: string | null
          encrypted_private_key?: string | null
          full_name?: string | null
          id?: string
          learns?: string[] | null
          quiz_completed?: boolean | null
          stardust_points?: number | null
          teaches?: string[] | null
          travel_end?: string | null
          travel_start?: string | null
          updated_at?: string
          user_id: string
          vision_completed?: boolean | null
          vision_statement?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          bridge?: Database["public"]["Enums"]["cultural_bridge"] | null
          created_at?: string
          current_city?: string | null
          display_name?: string | null
          encrypted_private_key?: string | null
          full_name?: string | null
          id?: string
          learns?: string[] | null
          quiz_completed?: boolean | null
          stardust_points?: number | null
          teaches?: string[] | null
          travel_end?: string | null
          travel_start?: string | null
          updated_at?: string
          user_id?: string
          vision_completed?: boolean | null
          vision_statement?: string | null
        }
        Relationships: []
      }
      roaming_beacons: {
        Row: {
          created_at: string
          expires_at: string | null
          fuzzed_lat: number | null
          fuzzed_lng: number | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          fuzzed_lat?: number | null
          fuzzed_lng?: number | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          fuzzed_lat?: number | null
          fuzzed_lng?: number | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      safe_spaces: {
        Row: {
          address: string | null
          category: string
          city: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          phone: string | null
          verified: boolean
          verified_by: string | null
        }
        Insert: {
          address?: string | null
          category?: string
          city: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          phone?: string | null
          verified?: boolean
          verified_by?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          city?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string | null
          verified?: boolean
          verified_by?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          expedition_id: string | null
          id: string
          platform_commission: number | null
          recipient_id: string | null
          sender_id: string | null
          status: string | null
          stripe_payment_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          expedition_id?: string | null
          id?: string
          platform_commission?: number | null
          recipient_id?: string | null
          sender_id?: string | null
          status?: string | null
          stripe_payment_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          expedition_id?: string | null
          id?: string
          platform_commission?: number | null
          recipient_id?: string | null
          sender_id?: string | null
          status?: string | null
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_expedition_id_fkey"
            columns: ["expedition_id"]
            isOneToOne: false
            referencedRelation: "expeditions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_rank: { Args: { _user_id: string }; Returns: number }
      has_min_rank: {
        Args: { _min_rank: number; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      promote_to_captain: { Args: { _user_id: string }; Returns: undefined }
      promote_to_steward: { Args: { _user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "steward"
      cultural_bridge: "western" | "dao-ist" | "islamic"
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
      app_role: ["admin", "moderator", "user", "steward"],
      cultural_bridge: ["western", "dao-ist", "islamic"],
    },
  },
} as const
