/**
 * Decodes a Google Encoded Polyline into an array of {lat, lon} points.
 * Algorithm: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
export interface LatLon {
  lat: number;
  lon: number;
}

export function decodePolyline(encoded: string): LatLon[] {
  const points: LatLon[] = [];
  let index = 0;
  let lat = 0;
  let lon = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    // Decode latitude
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    // Decode longitude
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
 * Simplify a polyline by keeping every Nth point (for rendering performance).
 */
export function simplifyPolyline(points: LatLon[], maxPoints: number): LatLon[] {
  if (points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  const result: LatLon[] = [];
  for (let i = 0; i < points.length; i += step) {
    result.push(points[i]);
  }
  // Always include last point
  if (result[result.length - 1] !== points[points.length - 1]) {
    result.push(points[points.length - 1]);
  }
  return result;
}
