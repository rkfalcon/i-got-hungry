export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: { Row: { user_id: string; default_area: string | null; created_at: string; updated_at: string }; Insert: { user_id: string; default_area?: string | null }; Update: { default_area?: string | null; updated_at?: string }; Relationships: [] };
      restaurants: { Row: { id: string; name: string; normalized_name: string; area: string; address: string | null; latitude: number | null; longitude: number | null; cuisines: string[]; created_at: string; updated_at: string }; Insert: never; Update: never; Relationships: [] };
      recommendation_evidence: { Row: { id: string; restaurant_id: string; source_url: string; source_profile: string | null; published_at: string; cuisine_clues: string[]; created_at: string }; Insert: never; Update: never; Relationships: [] };
      saved_searches: { Row: { id: string; user_id: string; area: string; cuisines: string[]; created_at: string }; Insert: { user_id: string; area: string; cuisines?: string[] }; Update: never; Relationships: [] };
      refresh_requests: { Row: { id: string; area: string; cuisines: string[]; status: string; requested_at: string; completed_at: string | null }; Insert: { area: string; cuisines?: string[]; status?: string; requested_at?: string; completed_at?: string | null }; Update: { status?: string; completed_at?: string | null }; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
