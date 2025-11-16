import type { LatLngBoundsExpression } from 'leaflet';
import type { MultiPolygon, Polygon } from 'geojson';
import { MapContainer, TileLayer, GeoJSON, ImageOverlay } from 'react-leaflet';
import type { Field, FieldAnalysis } from '@/types';

interface Props {
  field?: Field;
  analysis?: FieldAnalysis;
}

const toBounds = (polygon?: Polygon | MultiPolygon): LatLngBoundsExpression => {
  if (!polygon) {
    return [
      [37.8, -96],
      [38, -95.5],
    ];
  }
  const coords = polygon.type === 'Polygon' ? polygon.coordinates.flat(1) : polygon.coordinates.flat(2);
  const lats = coords.map((coord) => coord[1]);
  const lngs = coords.map((coord) => coord[0]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
};

export const FieldMap = ({ field, analysis }: Props) => {
  const bounds = toBounds(field?.boundaryGeoJson);

  return (
    <div className="h-[420px] overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40">
      <MapContainer
        bounds={bounds}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        className="leaflet-container"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        {field && (
          <GeoJSON
            data={field.boundaryGeoJson}
            style={{ color: '#22c55e', weight: 2, fillOpacity: 0.1 }}
          />
        )}
        {analysis?.ndviRasterUrl && (
          <ImageOverlay
            url={analysis.ndviRasterUrl}
            bounds={bounds}
            opacity={0.7}
            eventHandlers={{ load: () => console.info('NDVI raster loaded') }}
          />
        )}
      </MapContainer>
    </div>
  );
};
