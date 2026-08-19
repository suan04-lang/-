import { DrinkLogItem, UserProfile } from '../types';

export interface BacResult {
  currentBac: number; // e.g. 0.065
  peakBac: number;
  totalPureAlcoholGrams: number;
  totalVolumeMl: number;
  totalCalories: number;
  sojuEquivalentGlasses: number;
  sojuEquivalentBottles: number;
  soberTimeMinutes: number; // minutes until 0.00%
  soberTimeDate: Date | null;
  drunkStage: number; // 0 to 4
  warningLevel: 'safe' | 'caution' | 'danger' | 'critical';
  statusText: string;
}

export function calculateBAC(
  logs: DrinkLogItem[],
  profile: UserProfile,
  currentTimeMs: number = Date.now()
): BacResult {
  if (logs.length === 0) {
    return {
      currentBac: 0,
      peakBac: 0,
      totalPureAlcoholGrams: 0,
      totalVolumeMl: 0,
      totalCalories: 0,
      sojuEquivalentGlasses: 0,
      sojuEquivalentBottles: 0,
      soberTimeMinutes: 0,
      soberTimeDate: null,
      drunkStage: 0,
      warningLevel: 'safe',
      statusText: '맑은 맨정신입니다'
    };
  }

  // Filter logs within the last 24 hours
  const validLogs = logs.filter(item => (currentTimeMs - item.timestamp) < 24 * 3600 * 1000);
  if (validLogs.length === 0) {
    return {
      currentBac: 0,
      peakBac: 0,
      totalPureAlcoholGrams: 0,
      totalVolumeMl: 0,
      totalCalories: 0,
      sojuEquivalentGlasses: 0,
      sojuEquivalentBottles: 0,
      soberTimeMinutes: 0,
      soberTimeDate: null,
      drunkStage: 0,
      warningLevel: 'safe',
      statusText: '술이 완전히 깼습니다'
    };
  }

  const r = profile.gender === 'male' ? 0.70 : 0.60;
  const eliminationRatePerHour = 0.015; // 0.015% per hour

  let totalGrams = 0;
  let totalVol = 0;
  let totalCals = 0;

  // Widmark multi-drink curve with absorption & elimination
  let currentBac = 0;
  let peakBac = 0;
  const earliestTime = Math.min(...validLogs.map(l => l.timestamp));

  validLogs.forEach(drink => {
    totalGrams += drink.alcoholGrams;
    totalVol += drink.volumeMl;
    totalCals += drink.calories;

    const hoursSinceDrink = Math.max(0, (currentTimeMs - drink.timestamp) / (1000 * 3600));
    // Added BAC from this drink
    const addedBac = (drink.alcoholGrams / (profile.weightKg * r * 10)) * 0.95;
    // Degraded
    const remainingForThis = Math.max(0, addedBac - (hoursSinceDrink * eliminationRatePerHour));
    currentBac += remainingForThis;
  });

  // Calculate peak
  peakBac = (totalGrams / (profile.weightKg * r * 10)) * 0.95;
  currentBac = Math.min(peakBac, Math.max(0, currentBac));
  currentBac = Number(currentBac.toFixed(4));

  // Pure alcohol for 1 soju glass is approx 6.4g (50ml * 16% * 0.8 = 6.4g)
  const sojuEquivalentGlasses = Number((totalGrams / 6.4).toFixed(1));
  const sojuEquivalentBottles = Number((sojuEquivalentGlasses / 7.2).toFixed(1));

  // Sober time
  const soberHoursNeeded = currentBac > 0 ? (currentBac / eliminationRatePerHour) : 0;
  const soberTimeMinutes = Math.round(soberHoursNeeded * 60);
  const soberTimeDate = currentBac > 0 ? new Date(currentTimeMs + soberTimeMinutes * 60 * 1000) : null;

  // Determine stage (0 to 4)
  let drunkStage = 0;
  let warningLevel: 'safe' | 'caution' | 'danger' | 'critical' = 'safe';
  let statusText = '맑은 맨정신';

  if (sojuEquivalentGlasses >= 9.0 || currentBac >= 0.16) {
    drunkStage = 4;
    warningLevel = 'critical';
    statusText = '🚨 떡실신 / 필름 끊김 단계 (절대 안전 귀가!)';
  } else if (sojuEquivalentGlasses >= 5.5 || currentBac >= 0.09) {
    drunkStage = 3;
    warningLevel = 'danger';
    statusText = '⚠️ 만취 꽐라 상태 (음주 즉시 중단 권장)';
  } else if (sojuEquivalentGlasses >= 2.5 || currentBac >= 0.045) {
    drunkStage = 2;
    warningLevel = 'caution';
    statusText = '🍻 흥오른 알딸딸 상태 (물 많이 마시기)';
  } else if (sojuEquivalentGlasses >= 0.5 || currentBac > 0.01) {
    drunkStage = 1;
    warningLevel = 'safe';
    statusText = '✨ 기분 좋은 텐션 (가벼운 한잔)';
  } else {
    drunkStage = 0;
    warningLevel = 'safe';
    statusText = '🌱 말끔한 맨정신';
  }

  return {
    currentBac,
    peakBac: Number(peakBac.toFixed(4)),
    totalPureAlcoholGrams: Math.round(totalGrams),
    totalVolumeMl: totalVol,
    totalCalories: totalCals,
    sojuEquivalentGlasses,
    sojuEquivalentBottles,
    soberTimeMinutes,
    soberTimeDate,
    drunkStage,
    warningLevel,
    statusText
  };
}
