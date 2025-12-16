/**
 * Filament drying parameters based on Bambu Lab's recommendations
 * Source: https://wiki.bambulab.com/en/filament-acc/filament/dry-filament
 * Appendix I: Recommended Drying Parameters for Each Filament Type
 * 
 * These values are for Forced-Air Oven / Dedicated Dryer (e.g., Space Pi X4)
 * 
 * AUTO-GENERATED - Run `npx tsx scripts/scrape-drying-params.ts` to update
 * Note: The warning functions below are maintained in the script template.
 */

export interface DryingParameters {
  temperature: string; // e.g., "50°C"
  duration: string;    // e.g., "8h"
}

/**
 * Lookup table mapping filament types to their recommended drying parameters
 * Using Forced-Air Oven column from Bambu Lab wiki (for dedicated dryers)
 */
const DRYING_PARAMETERS: Record<string, DryingParameters> = {
  'PLA Basic/PLA Matte': { temperature: '50°C', duration: '8h' },
  'PLA Silk+': { temperature: '55°C', duration: '8h' },
  'PLA-CF': { temperature: '55°C', duration: '8h' },
  'PLA-GF': { temperature: '55°C', duration: '8h' },
  'PLA': { temperature: '55°C', duration: '8h' },
  'PLA Wood': { temperature: '60°C', duration: '8h' },
  'PLA Aero': { temperature: '55°C', duration: '8h' },
  'Support for PLA': { temperature: '55°C', duration: '8h' },
  'Support for PLA/PETG': { temperature: '55°C', duration: '8h' },
  'PETG': { temperature: '63°C', duration: '8h' },
  'PETG-CF': { temperature: '63°C', duration: '8h' },
  'ABS': { temperature: '80°C', duration: '8h' },
  'ASA': { temperature: '80°C', duration: '8h' },
  'ASA Aero': { temperature: '80°C', duration: '8h' },
  'TPU': { temperature: '70°C', duration: '8h' },
  'PC': { temperature: '80°C', duration: '8h' },
  'PVA': { temperature: '80°C', duration: '10h' },
  'BVOH': { temperature: '80°C', duration: '10h' },
  'Support for PA/PET': { temperature: '80°C', duration: '10h' },
  'PA': { temperature: '80°C', duration: '10h' },
  'PA-CF': { temperature: '80°C', duration: '10h' },
  'PA-GF': { temperature: '80°C', duration: '10h' },
  'PAHT-CF': { temperature: '80°C', duration: '10h' },
  'PAHT-GF': { temperature: '80°C', duration: '10h' },
  'PAHT': { temperature: '80°C', duration: '10h' },
  'PET-CF': { temperature: '80°C', duration: '10h' },
  'PPA-CF': { temperature: '120°C', duration: '10h' },
  'PPA-GF': { temperature: '120°C', duration: '10h' },
  'PPA': { temperature: '120°C', duration: '10h' },
  'PPS': { temperature: '120°C', duration: '10h' },
  'PPS-CF': { temperature: '120°C', duration: '10h' },
  'PPS-GF': { temperature: '120°C', duration: '10h' },
  'Support for ABS': { temperature: '80°C', duration: '4h' },
};

/**
 * Get drying parameters for a given filament type
 * @param filamentType - The type of filament (e.g., "PLA Basic", "PETG-CF")
 * @returns Drying parameters or undefined if not found
 */
export function getDryingParameters(filamentType: string): DryingParameters | undefined {
  // Try exact match first
  if (DRYING_PARAMETERS[filamentType]) {
    return DRYING_PARAMETERS[filamentType];
  }
  
  // Try case-insensitive match
  const normalizedType = filamentType.toUpperCase();
  for (const [key, value] of Object.entries(DRYING_PARAMETERS)) {
    if (key.toUpperCase() === normalizedType) {
      return value;
    }
  }
  
  // Try partial match (e.g., "PLA Basic White" should match "PLA Basic")
  // Sort by key length descending to match more specific types first
  const sortedEntries = Object.entries(DRYING_PARAMETERS)
    .sort(([a], [b]) => b.length - a.length);
  
  for (const [key, value] of sortedEntries) {
    if (normalizedType.includes(key.toUpperCase())) {
      return value;
    }
  }
  
  return undefined;
}

/**
 * Extract filament type from product title
 * @param title - Product title (e.g., "Bambu Lab PLA Basic Filament - White")
 * @returns Detected filament type or undefined
 */
export function extractFilamentType(title: string): string | undefined {
  const normalizedTitle = title.toUpperCase();
  
  // Sort by length (longest first) to match more specific types first
  const sortedTypes = Object.keys(DRYING_PARAMETERS).sort((a, b) => b.length - a.length);
  
  for (const type of sortedTypes) {
    if (normalizedTitle.includes(type.toUpperCase())) {
      return type;
    }
  }
  
  return undefined;
}

/**
 * Filament warning types for special storage/handling instructions
 */
export interface FilamentWarning {
  type: 'PA_MOISTURE' | 'PC_BRITTLENESS';
  shortText: string;
  fullText: string;
}

/**
 * PA-based filament types that are highly hygroscopic
 */
const PA_BASED_TYPES = ['PA', 'PA-CF', 'PA-GF', 'PAHT-CF', 'PAHT-GF', 'PAHT', 'PPA-CF', 'PPA-GF', 'PPA'];

/**
 * Check if a filament type is PA-based (Polyamide/Nylon based)
 */
function isPABasedFilament(filamentType: string): boolean {
  const normalized = filamentType.toUpperCase();
  return PA_BASED_TYPES.some(type => normalized.includes(type.toUpperCase()));
}

/**
 * Check if a filament type is PC (Polycarbonate)
 */
function isPCFilament(filamentType: string): boolean {
  const normalized = filamentType.toUpperCase();
  // Match PC but not PPC or other variants that contain PC
  return normalized === 'PC' || 
         normalized.startsWith('PC-') || 
         normalized.startsWith('PC ') ||
         normalized.includes(' PC ') ||
         normalized.endsWith(' PC');
}

/**
 * Get storage/handling warning for specific filament types
 * PA-based filaments: Absorb significant moisture after ~3 months in open air.
 *   Becomes very difficult to dry with standard 80-90°C ovens.
 * PC filaments: May become brittle after repeated drying cycles due to thermal stress.
 * 
 * @param filamentType - The type of filament
 * @returns Warning info or undefined if no special warning needed
 */
export function getFilamentWarning(filamentType: string): FilamentWarning | undefined {
  if (isPABasedFilament(filamentType)) {
    return {
      type: 'PA_MOISTURE',
      shortText: '⚠️ Store sealed with desiccant!',
      fullText: 'PA filaments absorb significant moisture after ~3 months in open air. Becomes very difficult to dry with standard 80-90°C ovens. Store sealed with desiccants if not used for extended periods.',
    };
  }
  
  if (isPCFilament(filamentType)) {
    return {
      type: 'PC_BRITTLENESS',
      shortText: '⚠️ Avoid repeated drying cycles!',
      fullText: 'PC may become brittle after repeated drying cycles due to thermal stress. After drying, keep sealed with desiccants. If well-protected, may need little or no re-drying.',
    };
  }
  
  return undefined;
}
