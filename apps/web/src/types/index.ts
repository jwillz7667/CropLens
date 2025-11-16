export type Field = {
  id: string;
  name: string;
  acreage: number;
  crop?: string;
  centroid: {
    lat: number;
    lng: number;
  };
  boundaryGeoJson: Polygon | MultiPolygon;
  latestAnalysis?: FieldAnalysis;
  updatedAt: string;
  createdAt: string;
};

export type FieldAnalysis = {
  id: string;
  fieldId: string;
  ndviRasterUrl?: string;
  summaryStats: {
    mean: number;
    min: number;
    max: number;
    stdDev: number;
  };
  lowNdviAreaPct: number;
  avgNdviDelta?: number;
  generatedAt: string;
};

export type Insight = {
  id: string;
  fieldId: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  recommendation: string;
  createdAt: string;
};

export type UploadUrlResponse = {
  uploadUrl: string;
  fileKey: string;
  formData?: Record<string, string>;
};

export type CreateFieldPayload = {
  name: string;
  acreage: number;
  crop?: string;
  centroid: {
    lat: number;
    lng: number;
  };
  boundaryGeoJson: Polygon | MultiPolygon;
};

export type StartAnalysisPayload = {
  fieldId: string;
  uploadKey?: string;
  source: 'upload' | 'sentinel';
  date?: string;
};
import type { MultiPolygon, Polygon } from 'geojson';
