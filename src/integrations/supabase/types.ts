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
          escalation_level: number
          id: string
          lat: number
          lng: number
          message: string | null
          resolved_at: string | null
          responder_count: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          escalation_level?: number
          id?: string
          lat: number
          lng: number
          message?: string | null
          resolved_at?: string | null
          responder_count?: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          escalation_level?: number
          id?: string
          lat?: number
          lng?: number
          message?: string | null
          resolved_at?: string | null
          responder_count?: number
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
          scraped_from: string | null
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
          scraped_from?: string | null
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
          scraped_from?: string | null
          source_url?: string | null
          title?: string
          venue?: string | null
          verified?: boolean | null
          verified_by?: string | null
        }
        Relationships: []
      }
      expedition_bookings: {
        Row: {
          created_at: string
          expedition_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expedition_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expedition_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expedition_bookings_expedition_id_fkey"
            columns: ["expedition_id"]
            isOneToOne: false
            referencedRelation: "expeditions"
            referencedColumns: ["id"]
          },
        ]
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
      functional_points: {
        Row: {
          address: string | null
          category: string
          city: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          lat: number
          lng: number
          name: string
          verified: boolean
          verified_by: string | null
        }
        Insert: {
          address?: string | null
          category: string
          city: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          lat: number
          lng: number
          name: string
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
          lat?: number
          lng?: number
          name?: string
          verified?: boolean
          verified_by?: string | null
        }
        Relationships: []
      }
      group_chat_members: {
        Row: {
          group_chat_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_chat_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_chat_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_chat_members_group_chat_id_fkey"
            columns: ["group_chat_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      group_chats: {
        Row: {
          created_at: string
          created_by: string
          expedition_id: string | null
          hangout_id: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expedition_id?: string | null
          hangout_id?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expedition_id?: string | null
          hangout_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_chats_expedition_id_fkey"
            columns: ["expedition_id"]
            isOneToOne: false
            referencedRelation: "expeditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_chats_hangout_id_fkey"
            columns: ["hangout_id"]
            isOneToOne: false
            referencedRelation: "hangouts"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          content: string
          created_at: string
          group_chat_id: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_chat_id: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_chat_id?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_chat_id_fkey"
            columns: ["group_chat_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      hangout_attendees: {
        Row: {
          created_at: string
          hangout_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hangout_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hangout_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hangout_attendees_hangout_id_fkey"
            columns: ["hangout_id"]
            isOneToOne: false
            referencedRelation: "hangouts"
            referencedColumns: ["id"]
          },
        ]
      }
      hangouts: {
        Row: {
          category: string
          created_at: string
          creator_id: string
          description: string | null
          hangout_time: string
          id: string
          lat: number | null
          lng: number | null
          location_name: string | null
          max_attendees: number | null
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          creator_id: string
          description?: string | null
          hangout_time: string
          id?: string
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          max_attendees?: number | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          creator_id?: string
          description?: string | null
          hangout_time?: string
          id?: string
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          max_attendees?: number | null
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
      music_identifications: {
        Row: {
          created_at: string
          genre: string | null
          id: string
          lat: number | null
          lng: number | null
          origin: string | null
          track_artist: string
          track_title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          genre?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          origin?: string | null
          track_artist: string
          track_title: string
          user_id: string
        }
        Update: {
          created_at?: string
          genre?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          origin?: string | null
          track_artist?: string
          track_title?: string
          user_id?: string
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
          instagram_handle: string | null
          learns: string[] | null
          quiz_completed: boolean | null
          social_verified: boolean | null
          stardust_points: number | null
          substack_url: string | null
          teaches: string[] | null
          telegram_handle: string | null
          travel_end: string | null
          travel_start: string | null
          updated_at: string
          user_id: string
          vision_completed: boolean | null
          vision_statement: string | null
          whatsapp_number: string | null
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
          instagram_handle?: string | null
          learns?: string[] | null
          quiz_completed?: boolean | null
          social_verified?: boolean | null
          stardust_points?: number | null
          substack_url?: string | null
          teaches?: string[] | null
          telegram_handle?: string | null
          travel_end?: string | null
          travel_start?: string | null
          updated_at?: string
          user_id: string
          vision_completed?: boolean | null
          vision_statement?: string | null
          whatsapp_number?: string | null
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
          instagram_handle?: string | null
          learns?: string[] | null
          quiz_completed?: boolean | null
          social_verified?: boolean | null
          stardust_points?: number | null
          substack_url?: string | null
          teaches?: string[] | null
          telegram_handle?: string | null
          travel_end?: string | null
          travel_start?: string | null
          updated_at?: string
          user_id?: string
          vision_completed?: boolean | null
          vision_statement?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
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
      sos_responses: {
        Row: {
          arrived_at: string | null
          beacon_id: string
          created_at: string
          eta_minutes: number | null
          id: string
          message: string | null
          responder_id: string
          status: string
        }
        Insert: {
          arrived_at?: string | null
          beacon_id: string
          created_at?: string
          eta_minutes?: number | null
          id?: string
          message?: string | null
          responder_id: string
          status?: string
        }
        Update: {
          arrived_at?: string | null
          beacon_id?: string
          created_at?: string
          eta_minutes?: number | null
          id?: string
          message?: string | null
          responder_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sos_responses_beacon_id_fkey"
            columns: ["beacon_id"]
            isOneToOne: false
            referencedRelation: "emergency_beacons"
            referencedColumns: ["id"]
          },
        ]
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
      award_stardust: {
        Args: { _points: number; _user_id: string }
        Returns: undefined
      }
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
      is_group_member: {
        Args: { _group_chat_id: string; _user_id: string }
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
