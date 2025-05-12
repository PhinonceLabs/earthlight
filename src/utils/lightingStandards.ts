// Lighting standards based on peer-reviewed research
// Key standards from organizations like WELL Building Standard, CIE, and scientific papers

export interface LightingRecommendation {
  name: string;
  description: string;
  source: string;
  url?: string;
}

export interface TimeIntensityPair {
  time: number; // 0-24 hour format
  intensity: number; // 0-100 percent
  temperature: number; // Kelvin
  spectralRatio?: SpectralRatio; // Optional spectral information
}

// Spectral content ratio based on research
export interface SpectralRatio {
  blueLight: number; // 0-100 percent of blue light component (450-495nm)
  greenLight: number; // 0-100 percent of green light component (495-570nm)
  redLight: number; // 0-100 percent of red light component (620-750nm)
  melanopicRatio?: number; // Melanopic/photopic ratio (M/P ratio)
}

export interface LightingSchedule {
  name: string;
  description: string;
  schedule: TimeIntensityPair[];
  citations: string[];
}

// Research-based recommendations
export const lightingRecommendations: LightingRecommendation[] = [
  {
    name: "WELL Building Standard v2",
    description: "Promotes lighting that supports circadian health with specific light intensity requirements at different times of day.",
    source: "International WELL Building Institute",
    url: "https://standard.wellcertified.com/light"
  },
  {
    name: "CIE S 026/E:2018",
    description: "System for metrology of optical radiation for ipRGC-influenced responses to light.",
    source: "International Commission on Illumination",
    url: "https://cie.co.at/publications/cie-system-metrology-optical-radiation-iprgc-influenced-responses-light-0"
  },
  {
    name: "Circadian Stimulus Model",
    description: "Developed by the Lighting Research Center, relates light spectrum, intensity, and timing to melatonin suppression.",
    source: "Lighting Research Center, Rensselaer Polytechnic Institute",
    url: "https://www.lrc.rpi.edu/programs/lightHealth/index.html"
  },
  {
    name: "EN 12464-1",
    description: "European standard for light and lighting for indoor workplaces.",
    source: "European Committee for Standardization",
    url: "https://www.en-standard.eu/bs-en-12464-1-2021-light-and-lighting-lighting-of-work-places-indoor-work-places/"
  }
];

// Standard preset schedules based on research
export const standardSchedules: LightingSchedule[] = [
  {
    name: "Optimal Office Lighting",
    description: "Designed for office environments to promote alertness during the day and proper wind-down in the evening.",
    schedule: [
      { time: 0, intensity: 5, temperature: 2200, spectralRatio: { blueLight: 5, greenLight: 15, redLight: 80, melanopicRatio: 0.2 } }, // Midnight
      { time: 5, intensity: 5, temperature: 2200, spectralRatio: { blueLight: 5, greenLight: 15, redLight: 80, melanopicRatio: 0.2 } }, // 5 AM
      { time: 6, intensity: 30, temperature: 3000, spectralRatio: { blueLight: 10, greenLight: 30, redLight: 60, melanopicRatio: 0.4 } }, // 6 AM
      { time: 7, intensity: 60, temperature: 4000, spectralRatio: { blueLight: 25, greenLight: 35, redLight: 40, melanopicRatio: 0.7 } }, // 7 AM
      { time: 8, intensity: 80, temperature: 5000, spectralRatio: { blueLight: 35, greenLight: 40, redLight: 25, melanopicRatio: 0.9 } }, // 8 AM
      { time: 9, intensity: 100, temperature: 6000, spectralRatio: { blueLight: 40, greenLight: 40, redLight: 20, melanopicRatio: 1.1 } }, // 9 AM
      { time: 12, intensity: 100, temperature: 6500, spectralRatio: { blueLight: 45, greenLight: 40, redLight: 15, melanopicRatio: 1.3 } }, // Noon
      { time: 16, intensity: 80, temperature: 5000, spectralRatio: { blueLight: 35, greenLight: 40, redLight: 25, melanopicRatio: 0.9 } }, // 4 PM
      { time: 18, intensity: 60, temperature: 3500, spectralRatio: { blueLight: 20, greenLight: 35, redLight: 45, melanopicRatio: 0.6 } }, // 6 PM
      { time: 20, intensity: 40, temperature: 2700, spectralRatio: { blueLight: 10, greenLight: 25, redLight: 65, melanopicRatio: 0.3 } }, // 8 PM
      { time: 22, intensity: 10, temperature: 2200, spectralRatio: { blueLight: 5, greenLight: 15, redLight: 80, melanopicRatio: 0.2 } }, // 10 PM
      { time: 24, intensity: 5, temperature: 2200, spectralRatio: { blueLight: 5, greenLight: 15, redLight: 80, melanopicRatio: 0.2 } }, // Midnight (next day)
    ],
    citations: [
      "Figueiro, M.G. et al. (2017). Circadian-effective light and its impact on alertness in office workers. Lighting Research & Technology, 49(2), 196-214.",
      "WELL Building Standard v2 Concept: Light, Feature L03: Circadian lighting design."
    ]
  },
  {
    name: "Healthcare Environment",
    description: "Schedule for healthcare settings that supports staff alertness and patient recovery cycles.",
    schedule: [
      { time: 0, intensity: 10, temperature: 2200, spectralRatio: { blueLight: 5, greenLight: 15, redLight: 80, melanopicRatio: 0.2 } }, // Midnight
      { time: 5, intensity: 10, temperature: 2200, spectralRatio: { blueLight: 5, greenLight: 15, redLight: 80, melanopicRatio: 0.2 } }, // 5 AM
      { time: 6, intensity: 40, temperature: 3500, spectralRatio: { blueLight: 20, greenLight: 35, redLight: 45, melanopicRatio: 0.5 } }, // 6 AM
      { time: 7, intensity: 70, temperature: 4500, spectralRatio: { blueLight: 30, greenLight: 40, redLight: 30, melanopicRatio: 0.8 } }, // 7 AM
      { time: 8, intensity: 90, temperature: 5500, spectralRatio: { blueLight: 38, greenLight: 42, redLight: 20, melanopicRatio: 1.0 } }, // 8 AM
      { time: 9, intensity: 100, temperature: 6000, spectralRatio: { blueLight: 42, greenLight: 40, redLight: 18, melanopicRatio: 1.2 } }, // 9 AM
      { time: 12, intensity: 100, temperature: 6500, spectralRatio: { blueLight: 45, greenLight: 40, redLight: 15, melanopicRatio: 1.3 } }, // Noon
      { time: 16, intensity: 90, temperature: 5500, spectralRatio: { blueLight: 38, greenLight: 42, redLight: 20, melanopicRatio: 1.0 } }, // 4 PM
      { time: 18, intensity: 70, temperature: 4500, spectralRatio: { blueLight: 30, greenLight: 40, redLight: 30, melanopicRatio: 0.8 } }, // 6 PM
      { time: 20, intensity: 50, temperature: 3500, spectralRatio: { blueLight: 20, greenLight: 35, redLight: 45, melanopicRatio: 0.5 } }, // 8 PM
      { time: 22, intensity: 20, temperature: 2700, spectralRatio: { blueLight: 10, greenLight: 20, redLight: 70, melanopicRatio: 0.25 } }, // 10 PM
      { time: 24, intensity: 10, temperature: 2200, spectralRatio: { blueLight: 5, greenLight: 15, redLight: 80, melanopicRatio: 0.2 } }, // Midnight (next day)
    ],
    citations: [
      "Giménez, M.C. et al. (2017). Patient room lighting influences on sleep, appraisal and mood in hospitalized people. Journal of Sleep Research, 26(2), 236-246.",
      "Bernhofer, E.I. et al. (2014). Hospital lighting and its association with sleep, mood and pain in medical inpatients. Journal of Advanced Nursing, 70(5), 1164-1173."
    ]
  },
  {
    name: "Educational Setting",
    description: "Optimized for classroom environments to enhance student alertness, learning capacity and wellbeing.",
    schedule: [
      { time: 0, intensity: 5, temperature: 2200, spectralRatio: { blueLight: 5, greenLight: 15, redLight: 80, melanopicRatio: 0.2 } }, // Midnight
      { time: 7, intensity: 50, temperature: 3500, spectralRatio: { blueLight: 20, greenLight: 35, redLight: 45, melanopicRatio: 0.6 } }, // 7 AM
      { time: 8, intensity: 90, temperature: 5000, spectralRatio: { blueLight: 35, greenLight: 40, redLight: 25, melanopicRatio: 0.9 } }, // 8 AM
      { time: 9, intensity: 100, temperature: 6000, spectralRatio: { blueLight: 40, greenLight: 40, redLight: 20, melanopicRatio: 1.2 } }, // 9 AM
      { time: 12, intensity: 100, temperature: 6500, spectralRatio: { blueLight: 45, greenLight: 40, redLight: 15, melanopicRatio: 1.3 } }, // Noon
      { time: 15, intensity: 90, temperature: 5500, spectralRatio: { blueLight: 38, greenLight: 42, redLight: 20, melanopicRatio: 1.0 } }, // 3 PM
      { time: 17, intensity: 70, temperature: 4000, spectralRatio: { blueLight: 25, greenLight: 35, redLight: 40, melanopicRatio: 0.7 } }, // 5 PM
      { time: 20, intensity: 40, temperature: 3000, spectralRatio: { blueLight: 15, greenLight: 25, redLight: 60, melanopicRatio: 0.4 } }, // 8 PM
      { time: 22, intensity: 10, temperature: 2500, spectralRatio: { blueLight: 8, greenLight: 17, redLight: 75, melanopicRatio: 0.25 } }, // 10 PM
      { time: 24, intensity: 5, temperature: 2200, spectralRatio: { blueLight: 5, greenLight: 15, redLight: 80, melanopicRatio: 0.2 } }, // Midnight (next day)
    ],
    citations: [
      "Mott, M.S. et al. (2012). Illuminating the effects of dynamic lighting on student learning. SAGE Open, 2(2).",
      "Sleegers, P.J. et al. (2016). Light effects on mental activity: classroom studies using dynamic lighting systems. LEUKOS, 12(1-2), 27-44."
    ]
  }
];

// Get color temperature name based on Kelvin value
export function getColorTemperatureName(kelvin: number): string {
  if (kelvin <= 2700) return "Warm";
  if (kelvin <= 3500) return "Warm White";
  if (kelvin <= 4500) return "Cool White";
  if (kelvin <= 5500) return "Daylight";
  if (kelvin <= 6500) return "Cool Daylight";
  return "Blue Sky";
}

// Get corresponding hex color for the temperature
export function kelvinToHex(kelvin: number): string {
  // Approximation of kelvin to RGB conversion
  const temp = kelvin / 100;
  let r, g, b;

  if (temp <= 66) {
    r = 255;
    g = temp;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
    if (temp <= 19) {
      b = 0;
    } else {
      b = temp - 10;
      b = 138.5177312231 * Math.log(b) - 305.0447927307;
    }
  } else {
    r = temp - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    g = temp - 60;
    g = 288.1221695283 * Math.pow(g, -0.0755148492);
    b = 255;
  }

  r = Math.min(255, Math.max(0, Math.round(r)));
  g = Math.min(255, Math.max(0, Math.round(g)));
  b = Math.min(255, Math.max(0, Math.round(b)));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// New function to get melanopic ratio description
export function getMelanopicRatioDescription(ratio: number | undefined): string {
  if (!ratio) return "Not available";
  if (ratio < 0.3) return "Very low (minimal alertness impact)";
  if (ratio < 0.6) return "Low (supports relaxation)";
  if (ratio < 0.9) return "Moderate (balanced)";
  if (ratio < 1.2) return "High (promotes alertness)";
  return "Very high (maximum alertness)";
}

// Calculate spectral content for a specific temperature
export function calculateSpectralContent(temperature: number): SpectralRatio {
  // This is a simplified model based on research findings
  // Real spectral content would require a more complex model
  let blueLight = 0;
  let greenLight = 0;
  let redLight = 0;
  let melanopicRatio = 0;
  
  if (temperature <= 2700) {
    // Warm light has more red content
    redLight = 65 + (2700 - temperature) / 50;
    greenLight = 25 - (2700 - temperature) / 100;
    blueLight = 100 - redLight - greenLight;
    melanopicRatio = 0.2 + (temperature - 2000) / 3500;
  } else if (temperature <= 4500) {
    // Balanced light
    redLight = 65 - (temperature - 2700) / 30;
    greenLight = 25 + (temperature - 2700) / 60;
    blueLight = 100 - redLight - greenLight;
    melanopicRatio = 0.4 + (temperature - 2700) / 3000;
  } else {
    // Cool light has more blue content
    blueLight = 35 + (temperature - 4500) / 100;
    greenLight = 40;
    redLight = 100 - blueLight - greenLight;
    melanopicRatio = 0.9 + (temperature - 4500) / 5000;
  }
  
  // Ensure values are within logical ranges
  blueLight = Math.min(Math.max(blueLight, 5), 50);
  greenLight = Math.min(Math.max(greenLight, 15), 45);
  redLight = Math.min(Math.max(redLight, 15), 80);
  melanopicRatio = Math.min(Math.max(melanopicRatio, 0.1), 1.5);
  
  return {
    blueLight: Math.round(blueLight),
    greenLight: Math.round(greenLight),
    redLight: Math.round(redLight),
    melanopicRatio: parseFloat(melanopicRatio.toFixed(2))
  };
}
