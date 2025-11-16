import { fromArrayBuffer } from 'geotiff';
import { PNG } from 'pngjs';

export type NdviSummary = {
  mean: number;
  min: number;
  max: number;
  stdDev: number;
  lowNdviAreaPct: number;
};

export type NdviResult = {
  summary: NdviSummary;
  raster: Buffer;
};

const toArrayBuffer = (buffer: ArrayBuffer | SharedArrayBuffer | Buffer): ArrayBuffer => {
  if (buffer instanceof ArrayBuffer) return buffer;
  if (typeof SharedArrayBuffer !== 'undefined' && buffer instanceof SharedArrayBuffer) {
    const arrayBuffer = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(arrayBuffer).set(new Uint8Array(buffer));
    return arrayBuffer;
  }
  if (Buffer.isBuffer(buffer)) {
    const arrayBuffer = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(arrayBuffer).set(buffer);
    return arrayBuffer;
  }
  throw new Error('Unsupported NDVI buffer source');
};

const colorForValue = (value: number) => {
  const clamped = Math.max(-0.2, Math.min(1, value));
  if (clamped < 0) {
    return [120, 53, 15];
  }
  const ratio = clamped;
  const red = Math.floor(255 - ratio * 155);
  const green = Math.floor(80 + ratio * 150);
  const blue = Math.floor(60 + ratio * 60);
  return [red, green, blue];
};

export const computeNdvi = async (source: ArrayBuffer | SharedArrayBuffer | Buffer): Promise<NdviResult> => {
  const tiff = await fromArrayBuffer(toArrayBuffer(source));
  const image = await tiff.getImage();
  const width = image.getWidth();
  const height = image.getHeight();
  const rasters = (await image.readRasters({ interleave: true })) as Float32Array;
  const ndviValues = new Float32Array(width * height);
  let sum = 0;
  let sumSquares = 0;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  let lowCount = 0;

  for (let i = 0; i < ndviValues.length; i += 1) {
    const nir = rasters[i * 2];
    const red = rasters[i * 2 + 1];
    const numerator = nir - red;
    const denominator = nir + red + 1e-6;
    const ndvi = denominator === 0 ? 0 : numerator / denominator;
    ndviValues[i] = ndvi;
    sum += ndvi;
    sumSquares += ndvi * ndvi;
    min = Math.min(min, ndvi);
    max = Math.max(max, ndvi);
    if (ndvi < 0.3) lowCount += 1;
  }

  const mean = sum / ndviValues.length;
  const variance = sumSquares / ndviValues.length - mean * mean;
  const stdDev = Math.sqrt(Math.max(variance, 0));
  const png = new PNG({ width, height });

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (width * y + x) << 2;
      const ndvi = ndviValues[width * y + x];
      const [r, g, b] = colorForValue(ndvi);
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = 255;
    }
  }

  const pngBuffer = PNG.sync.write(png);

  return {
    summary: {
      mean,
      min,
      max,
      stdDev,
      lowNdviAreaPct: lowCount / ndviValues.length,
    },
    raster: pngBuffer,
  };
};
