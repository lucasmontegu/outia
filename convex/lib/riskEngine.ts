/**
 * Risk Engine — Pure TS scoring functions.
 * No Convex runtime dependencies; can be unit-tested standalone.
 */

export type RiskLevel = "low" | "moderate" | "high" | "extreme";

export interface WeatherPoint {
  precipProb: number; // 0-100
  precipIntensity?: number; // mm/h
  windSpeedKmh: number;
  alertType?: string;
  alertSeverity?: "minor" | "moderate" | "severe" | "extreme";
}

export interface PointRiskResult {
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
}

// ─── Point Risk ──────────────────────────────────────────────
// precipScore (max 50) + windScore (max 20) + alertScore (max 30)

export function calculatePointRisk(point: WeatherPoint): PointRiskResult {
  const precipScore = calcPrecipScore(point);
  const windScore = calcWindScore(point.windSpeedKmh);
  const alertScore = calcAlertScore(point);

  const riskScore = Math.min(100, Math.round(precipScore + windScore + alertScore));
  return { riskScore, riskLevel: scoreToLevel(riskScore) };
}

function calcPrecipScore(point: WeatherPoint): number {
  const probFactor = (point.precipProb / 100) * 30; // max 30 from probability
  const intensityFactor = point.precipIntensity
    ? Math.min(20, (point.precipIntensity / 10) * 20) // max 20 from intensity (10mm/h = max)
    : (point.precipProb / 100) * 10; // fallback estimate
  return probFactor + intensityFactor;
}

function calcWindScore(windSpeedKmh: number): number {
  if (windSpeedKmh < 20) return 0;
  if (windSpeedKmh < 40) return ((windSpeedKmh - 20) / 20) * 10;
  if (windSpeedKmh < 70) return 10 + ((windSpeedKmh - 40) / 30) * 10;
  return 20; // max
}

function calcAlertScore(point: WeatherPoint): number {
  if (!point.alertSeverity) return 0;
  const severityMap: Record<string, number> = {
    minor: 5,
    moderate: 15,
    severe: 25,
    extreme: 30,
  };
  return severityMap[point.alertSeverity] ?? 0;
}

// ─── Route Risk ──────────────────────────────────────────────
// Weighted average biased towards worst segments

export function calculateRouteRisk(pointScores: number[]): PointRiskResult {
  if (pointScores.length === 0) return { riskScore: 0, riskLevel: "low" };

  const sorted = [...pointScores].sort((a, b) => b - a);
  const topCount = Math.max(1, Math.ceil(sorted.length * 0.3));
  const topAvg = sorted.slice(0, topCount).reduce((s, v) => s + v, 0) / topCount;
  const fullAvg = sorted.reduce((s, v) => s + v, 0) / sorted.length;

  // 60% weighted to worst segments, 40% to overall average
  const riskScore = Math.round(topAvg * 0.6 + fullAvg * 0.4);
  return { riskScore, riskLevel: scoreToLevel(riskScore) };
}

// ─── Day Score ───────────────────────────────────────────────
// Inverse of average risk for typical departure window

export function calculateDayScore(avgRisk: number): number {
  return Math.max(0, Math.min(100, Math.round(100 - avgRisk)));
}

// ─── Helpers ─────────────────────────────────────────────────

export function scoreToLevel(score: number): RiskLevel {
  if (score <= 25) return "low";
  if (score <= 50) return "moderate";
  if (score <= 75) return "high";
  return "extreme";
}

export function riskLevelColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: "#22c55e",
    moderate: "#eab308",
    high: "#f97316",
    extreme: "#ef4444",
  };
  return colors[level];
}
