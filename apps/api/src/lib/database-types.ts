import type { MultiPolygon, Polygon } from 'geojson';

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      fields: {
        Row: {
          id: string;
          name: string;
          acreage: number;
          crop: string | null;
          centroid: {
            lat: number;
            lng: number;
          };
          boundary_geojson: Polygon | MultiPolygon;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['fields']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['fields']['Row']>;
        Relationships: [];
      };
      analyses: {
        Row: {
          id: string;
          field_id: string;
          ndvi_raster_uri: string | null;
          summary_stats: {
            mean: number;
            min: number;
            max: number;
            stdDev: number;
            lowNdviAreaPct: number;
          };
          low_ndvi_area_pct: number;
          avg_ndvi_delta: number | null;
          source: 'upload' | 'sentinel';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['analyses']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['analyses']['Row']>;
        Relationships: [];
      };
      insights: {
        Row: {
          id: string;
          field_id: string;
          message: string;
          recommendation: string;
          severity: 'low' | 'medium' | 'high';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['insights']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['insights']['Row']>;
        Relationships: [];
      };
      integrations: {
        Row: {
          id: string;
          owner_id: string;
          sentinel_instance_id: string | null;
          sentinel_key: string | null;
          stripe_secret: string | null;
          storage_bucket: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['integrations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['integrations']['Row']>;
        Relationships: [];
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
};
