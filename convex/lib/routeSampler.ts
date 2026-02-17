/**
 * Route Sampler — Selects points along a polyline for weather queries.
 * Samples every ~30-45 min of travel or ~50km, whichever comes first.
 */

interface PolylinePoint {
  lat: number;
  lon: number;
}

export interface SampledPoint {
  lat: number;
  lon: number;
  etaAt: number; // epoch ms — estimated time of arrival at this point
  pointIndex: number;
}

const MIN_INTERVAL_KM = 40;
const MAX_INTERVAL_KM = 60;
const TARGET_INTERVAL_KM = 50;
const MIN_INTERVAL_MS = 25 * 60 * 1000; // 25 min
const MAX_INTERVAL_MS = 50 * 60 * 1000; // 50 min

/**
 * Decode a Google Encoded Polyline into lat/lon points.
 */
export function decodePolyline(encoded: string): PolylinePoint[] {
  const points: PolylinePoint[] = [];
  let index = 0;
  let lat = 0;
  let lon = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lon += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat / 1e5, lon: lon / 1e5 });
  }
  return points;
}

/**
 * Sample points along the route for weather data.
 * Always includes origin and destination.
 */
export function sampleRoute(
  encodedPolyline: string,
  departureAt: number,
  totalDurationSeconds: number,
  reduceSampling: boolean = false
): SampledPoint[] {
  const points = decodePolyline(encodedPolyline);
  if (points.length === 0) return [];

  const targetIntervalKm = reduceSampling ? TARGET_INTERVAL_KM * 1.5 : TARGET_INTERVAL_KM;

  // Calculate cumulative distances along the polyline
  const distances: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    const d = haversine(points[i - 1], points[i]);
    distances.push(distances[i - 1] + d);
  }

  const totalDistanceKm = distances[distances.length - 1];
  if (totalDistanceKm === 0) {
    return [{ lat: points[0].lat, lon: points[0].lon, etaAt: departureAt, pointIndex: 0 }];
  }

  const sampled: SampledPoint[] = [];
  let nextSampleDistKm = 0;
  let pointIndex = 0;

  // Always include origin
  sampled.push({
    lat: points[0].lat,
    lon: points[0].lon,
    etaAt: departureAt,
    pointIndex: pointIndex++,
  });
  nextSampleDistKm = targetIntervalKm;

  // Walk the polyline and sample at intervals
  for (let i = 1; i < points.length; i++) {
    if (distances[i] >= nextSampleDistKm) {
      const fraction = distances[i] / totalDistanceKm;
      const etaAt = departureAt + fraction * totalDurationSeconds * 1000;

      sampled.push({
        lat: points[i].lat,
        lon: points[i].lon,
        etaAt: Math.round(etaAt),
        pointIndex: pointIndex++,
      });
      nextSampleDistKm = distances[i] + targetIntervalKm;
    }
  }

  // Always include destination if not already
  const lastPoint = points[points.length - 1];
  const lastSampled = sampled[sampled.length - 1];
  if (
    Math.abs(lastPoint.lat - lastSampled.lat) > 0.001 ||
    Math.abs(lastPoint.lon - lastSampled.lon) > 0.001
  ) {
    sampled.push({
      lat: lastPoint.lat,
      lon: lastPoint.lon,
      etaAt: departureAt + totalDurationSeconds * 1000,
      pointIndex: pointIndex++,
    });
  }

  return sampled;
}

/**
 * Haversine formula — distance between two points in km.
 */
function haversine(a: PolylinePoint, b: PolylinePoint): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const c =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLon * sinLon;
  return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
