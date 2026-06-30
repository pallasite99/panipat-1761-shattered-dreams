/**
 * Fuzzy Logic Weather Inference Engine
 * Built for 18th Century Historical Battle Simulation
 * Calculates real-time fuzzy membership sets and outcomes using Mamdani-style rules
 * and Sugeno-style weighted average defuzzification.
 */

// Define helper to evaluate trapezoidal/triangular membership functions
function trimf(x: number, a: number, b: number, c: number): number {
  return Math.max(0, Math.min((x - a) / (b - a), (c - x) / (c - b)));
}

function trapmf(x: number, a: number, b: number, c: number, d: number): number {
  return Math.max(0, Math.min(Math.min((x - a) / (b - a), 1), (d - x) / (d - c)));
}

export interface FuzzyInputSets {
  temperature: {
    cold: number;
    moderate: number;
    hot: number;
    extreme: number;
  };
  windSpeed: {
    calm: number;
    moderate: number;
    high: number;
  };
  dustDensity: {
    low: number;
    moderate: number;
    high: number;
  };
}

export interface FuzzyOutputSets {
  speedPenalty: {
    low: number;
    moderate: number;
    severe: number;
  };
  moraleDrain: {
    negligible: number;
    moderate: number;
    rapid: number;
  };
  accuracyPenalty: {
    mild: number;
    moderate: number;
    severe: number;
  };
}

export interface FuzzyWeatherOutputs {
  speedMultiplier: number;
  moraleDrainMultiplier: number;
  accuracyMultiplier: number;
  inputs: {
    temperature: number;
    windSpeed: number;
    dustDensity: number;
  };
  memberships: FuzzyInputSets;
  activeRules: string[];
}

// Map weather preset to nominal numeric inputs
export interface WeatherPresetInputs {
  temperature: number; // °C
  windSpeed: number;    // km/h
  dustDensity: number;  // % (or humidity/storm density)
}

export const WEATHER_PRESETS: Record<string, WeatherPresetInputs> = {
  clear: { temperature: 28, windSpeed: 8, dustDensity: 12 },
  rain: { temperature: 18, windSpeed: 22, dustDensity: 40 },
  dust_storm: { temperature: 38, windSpeed: 75, dustDensity: 90 },
  fog: { temperature: 4, windSpeed: 12, dustDensity: 85 },
  extreme_heat: { temperature: 48, windSpeed: 15, dustDensity: 30 },
};

export function evaluateFuzzyWeather(
  temp: number,
  wind: number,
  dust: number
): FuzzyWeatherOutputs {
  // 1. FUZZIFICATION
  // Temperature memberships
  const tempCold = trapmf(temp, -10, -5, 10, 20);
  const tempModerate = trimf(temp, 10, 22, 32);
  const tempHot = trimf(temp, 25, 35, 42);
  const tempExtreme = trapmf(temp, 38, 45, 100, 100);

  // Wind speed memberships
  const windCalm = trapmf(wind, 0, 0, 10, 25);
  const windModerate = trimf(wind, 15, 30, 50);
  const windHigh = trapmf(wind, 40, 60, 150, 150);

  // Dust Density / Atmosphere opacity memberships
  const dustLow = trapmf(dust, 0, 0, 20, 40);
  const dustModerate = trimf(dust, 25, 50, 75);
  const dustHigh = trapmf(dust, 60, 85, 100, 100);

  const memberships: FuzzyInputSets = {
    temperature: { cold: tempCold, moderate: tempModerate, hot: tempHot, extreme: tempExtreme },
    windSpeed: { calm: windCalm, moderate: windModerate, high: windHigh },
    dustDensity: { low: dustLow, moderate: dustModerate, high: dustHigh },
  };

  // 2. FUZZY RULE INFERENCE (Mamdani style minimum conjunction)
  // Rule outputs for Speed Penalty
  const r_speed_severe = Math.max(tempExtreme, windHigh, dustHigh);
  const r_speed_moderate = Math.max(tempHot, windModerate, dustModerate);
  const r_speed_low = Math.max(tempCold, tempModerate, windCalm, dustLow);

  // Rule outputs for Morale Attrition Rate
  const r_morale_rapid = Math.max(tempExtreme, dustHigh); // Extreme Heat or heavy Dust Storm drains soldiers extremely fast
  const r_morale_moderate = Math.max(tempHot, windHigh, dustModerate);
  const r_morale_negligible = Math.max(tempCold, tempModerate, windCalm, dustLow);

  // Rule outputs for Combat Accuracy Penalty
  const r_acc_severe = Math.max(dustHigh, windHigh); // blinded by sands or heavy wind sway
  const r_acc_moderate = Math.max(tempCold, windModerate, dustModerate); // shivering or mild sand drift
  const r_acc_mild = Math.min(tempModerate, windCalm, dustLow);

  // 3. DEFUZZIFICATION (Sugeno-style Weighted Average)
  // Speed Penalty centroids: Severe = 0.52 (52% speed), Moderate = 0.78, Low = 1.0 (no penalty)
  const sumSpeedWeights = r_speed_severe + r_speed_moderate + r_speed_low;
  const speedMultiplier = sumSpeedWeights > 0
    ? (r_speed_severe * 0.52 + r_speed_moderate * 0.78 + r_speed_low * 1.0) / sumSpeedWeights
    : 1.0;

  // Morale Drain Centroids: Rapid = 2.4x drain, Moderate = 1.5x drain, Negligible = 0.8x drain
  const sumMoraleWeights = r_morale_rapid + r_morale_moderate + r_morale_negligible;
  const moraleDrainMultiplier = sumMoraleWeights > 0
    ? (r_morale_rapid * 2.4 + r_morale_moderate * 1.5 + r_morale_negligible * 0.8) / sumMoraleWeights
    : 1.0;

  // Accuracy Penalty Centroids: Severe = 0.40 (60% penalty), Moderate = 0.75, Mild = 1.0 (no penalty)
  const sumAccWeights = r_acc_severe + r_acc_moderate + r_acc_mild;
  const accuracyMultiplier = sumAccWeights > 0
    ? (r_acc_severe * 0.40 + r_acc_moderate * 0.75 + r_acc_mild * 1.0) / sumAccWeights
    : 1.0;

  // Compile active rules list to display to the user
  const activeRules: string[] = [];
  if (tempExtreme > 0.1) activeRules.push(`IF temp is EXTREME (${(tempExtreme * 100).toFixed(0)}%) THEN speed is SEVERE, morale is RAPID`);
  if (dustHigh > 0.1) activeRules.push(`IF dust is HIGH (${(dustHigh * 100).toFixed(0)}%) THEN accuracy is SEVERE, morale is RAPID`);
  if (windHigh > 0.1) activeRules.push(`IF wind is HIGH (${(windHigh * 100).toFixed(0)}%) THEN speed is SEVERE, accuracy is SEVERE`);
  if (tempHot > 0.1 && activeRules.length < 3) activeRules.push(`IF temp is HOT (${(tempHot * 100).toFixed(0)}%) THEN speed is MODERATE, morale is MODERATE`);
  if (windModerate > 0.1 && activeRules.length < 3) activeRules.push(`IF wind is MODERATE (${(windModerate * 100).toFixed(0)}%) THEN accuracy is MODERATE`);
  if (activeRules.length === 0) activeRules.push("Standard atmospheric equilibrium. No critical fuzzy rule fire.");

  return {
    speedMultiplier,
    moraleDrainMultiplier,
    accuracyMultiplier,
    inputs: {
      temperature: temp,
      windSpeed: wind,
      dustDensity: dust,
    },
    memberships,
    activeRules,
  };
}
