import type { MultiPolygon, Polygon } from 'geojson';

const { SENTINEL_INSTANCE_ID, SENTINEL_API_KEY } = process.env;

if (!SENTINEL_INSTANCE_ID) {
  console.warn('Set SENTINEL_INSTANCE_ID to enable satellite pulls.');
}

const PROCESS_ENDPOINT = 'https://services.sentinel-hub.com/api/v1/process';

export type SentinelRequest = {
  geometry: Polygon | MultiPolygon;
  from?: string;
  to?: string;
};

const evalscript = `//VERSION=3
function setup() {
  return {
    input: [{ bands: ['B08', 'B04'], units: 'REFLECTANCE' }],
    output: {
      id: 'default',
      bands: 2,
      sampleType: 'FLOAT32',
    },
  };
}

function evaluatePixel(sample) {
  return [sample.B08, sample.B04];
}`;

export const fetchSentinelScene = async ({ geometry, from, to }: SentinelRequest) => {
  if (!SENTINEL_API_KEY) {
    throw new Error('SENTINEL_API_KEY is required to pull imagery');
  }

  const payload = {
    input: {
      bounds: {
        geometry,
      },
      data: [
        {
          type: 'sentinel-2-l2a',
          dataFilter: {
            timeRange: {
              from: from ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              to: to ?? new Date().toISOString(),
            },
            mosaickingOrder: 'mostRecent',
            cloudCoverage: 40,
          },
        },
      ],
    },
    output: {
      width: 512,
      height: 512,
      responses: [
        {
          identifier: 'default',
          format: {
            type: 'image/tiff',
          },
        },
      ],
    },
    evalscript,
  };

  const response = await fetch(`${PROCESS_ENDPOINT}?instanceId=${SENTINEL_INSTANCE_ID}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${SENTINEL_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Sentinel request failed: ${response.status} ${await response.text()}`);
  }

  return Buffer.from(await response.arrayBuffer());
};
