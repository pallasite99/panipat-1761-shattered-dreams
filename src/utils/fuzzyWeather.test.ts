import { describe, it, expect } from 'vitest';
import { evaluateFuzzyWeather, WEATHER_PRESETS } from './fuzzyWeather';

describe('Fuzzy Weather Inference Engine', () => {
  it('should accurately evaluate clear weather with minimal modifiers', () => {
    const clearPreset = WEATHER_PRESETS.clear;
    const result = evaluateFuzzyWeather(
      clearPreset.temperature,
      clearPreset.windSpeed,
      clearPreset.dustDensity
    );

    expect(result.speedMultiplier).toBeGreaterThanOrEqual(0.8);
    expect(result.accuracyMultiplier).toBeGreaterThanOrEqual(0.8);
    expect(result.moraleDrainMultiplier).toBeLessThan(1.5);
    expect(result.activeRules.length).toBeGreaterThan(0);
  });

  it('should enforce severe penalties during a heavy dust storm', () => {
    const stormPreset = WEATHER_PRESETS.dust_storm;
    const result = evaluateFuzzyWeather(
      stormPreset.temperature,
      stormPreset.windSpeed,
      stormPreset.dustDensity
    );

    // Severe penalties should degrade movement and accuracy
    expect(result.speedMultiplier).toBeLessThan(0.7);
    expect(result.accuracyMultiplier).toBeLessThan(0.6);
    // Severe weather should increase morale drain rate significantly
    expect(result.moraleDrainMultiplier).toBeGreaterThanOrEqual(1.8);
    expect(result.activeRules.some(r => r.includes('dust is HIGH'))).toBe(true);
  });

  it('should evaluate cold, windy weather accurately', () => {
    const result = evaluateFuzzyWeather(0, 45, 10);

    expect(result.memberships.temperature.cold).toBeGreaterThan(0);
    expect(result.memberships.windSpeed.high).toBeGreaterThan(0);
    expect(result.speedMultiplier).toBeLessThan(1.0);
  });

  it('should fallback to defaults when given zero or neutral inputs', () => {
    const result = evaluateFuzzyWeather(22, 5, 5);

    expect(result.speedMultiplier).toBeCloseTo(1.0, 1);
    expect(result.accuracyMultiplier).toBeCloseTo(1.0, 1);
    expect(result.moraleDrainMultiplier).toBeCloseTo(0.8, 1);
  });
});
