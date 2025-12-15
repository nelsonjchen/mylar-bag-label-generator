/**
 * Script to scrape drying parameters from Bambu Lab wiki and generate dryingParameters.ts
 * 
 * Run with: npx tsx scripts/scrape-drying-params.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface DryingEntry {
    filamentType: string;
    ovenTemp: string;
    ovenDuration: string;
}

async function scrapeDryingParameters(): Promise<DryingEntry[]> {
    const url = 'https://wiki.bambulab.com/en/filament-acc/filament/dry-filament';

    console.log('Fetching Bambu Lab wiki page...');
    const response = await fetch(url);
    const html = await response.text();

    // Find all tables
    const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/gi;
    const tables = html.match(tableRegex);

    if (!tables) {
        throw new Error('No tables found on page');
    }

    console.log(`Found ${tables.length} tables, searching for drying parameters...`);

    const entries: DryingEntry[] = [];

    // Find the drying parameters table 
    for (const table of tables) {
        if (table.includes('PLA') && (table.includes('°C') || table.includes('℃'))) {
            // Extract rows
            const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
            const rows = table.match(rowRegex);

            if (rows && rows.length > 1) {
                // Skip header row, process data rows
                for (let j = 1; j < rows.length; j++) {
                    const row = rows[j];
                    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
                    const cells: string[] = [];
                    let match;

                    while ((match = tdRegex.exec(row)) !== null) {
                        const text = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
                        cells.push(text);
                    }

                    // Format: Filament | Requirement | Desiccant | Oven Temp | Oven Duration | ...
                    if (cells.length >= 5) {
                        const filamentType = cells[0];
                        const ovenTemp = cells[3];
                        const ovenDuration = cells[4];

                        entries.push({ filamentType, ovenTemp, ovenDuration });
                    }
                }
            }
        }
    }

    return entries;
}

function parseTemperature(temp: string): string {
    // Handle ranges like "50-60" -> take middle, or single values
    const match = temp.match(/(\d+)(?:-(\d+))?/);
    if (match) {
        if (match[2]) {
            // Range: take middle value
            const mid = Math.round((parseInt(match[1]) + parseInt(match[2])) / 2);
            return `${mid}°C`;
        } else {
            return `${match[1]}°C`;
        }
    }
    return temp;
}

function parseDuration(duration: string): string {
    // Handle ranges like "8-12" -> take middle, or single values
    const match = duration.match(/(\d+)(?:-(\d+))?/);
    if (match) {
        if (match[2]) {
            const mid = Math.round((parseInt(match[1]) + parseInt(match[2])) / 2);
            return `${mid}h`;
        } else {
            return `${match[1]}h`;
        }
    }
    return duration;
}

function expandFilamentTypes(entry: DryingEntry): { name: string; temp: string; duration: string }[] {
    const temp = parseTemperature(entry.ovenTemp);
    const duration = parseDuration(entry.ovenDuration);

    // Split on common delimiters and expand
    const types = entry.filamentType
        .split(/[、,]/)
        .map(t => t.trim())
        // Remove Chinese characters and other non-ASCII except allowed punctuation
        .map(t => t.replace(/[^\x00-\x7F]+/g, '').trim())
        .filter(t => t.length > 0);

    const expanded: { name: string; temp: string; duration: string }[] = [];

    for (const type of types) {
        // Handle "X-CF/GF" patterns -> expand to X-CF and X-GF
        const cfgfMatch = type.match(/^(.+)-CF\/GF$/);
        if (cfgfMatch) {
            expanded.push({ name: `${cfgfMatch[1]}-CF`, temp, duration });
            expanded.push({ name: `${cfgfMatch[1]}-GF`, temp, duration });
            expanded.push({ name: cfgfMatch[1], temp, duration });
        } else {
            expanded.push({ name: type, temp, duration });
        }
    }

    return expanded;
}

function generateTypeScriptFile(entries: DryingEntry[]): string {
    const allTypes: { name: string; temp: string; duration: string }[] = [];

    for (const entry of entries) {
        allTypes.push(...expandFilamentTypes(entry));
    }

    // Deduplicate by name, keeping first occurrence
    const seen = new Set<string>();
    const uniqueTypes = allTypes.filter(({ name }) => {
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
    });

    // Generate the lookup object entries
    const lookupEntries = uniqueTypes
        .map(({ name, temp, duration }) => `  '${name}': { temperature: '${temp}', duration: '${duration}' },`)
        .join('\n');

    return `/**
 * Filament drying parameters based on Bambu Lab's recommendations
 * Source: https://wiki.bambulab.com/en/filament-acc/filament/dry-filament
 * Appendix I: Recommended Drying Parameters for Each Filament Type
 * 
 * These values are for Forced-Air Oven / Dedicated Dryer (e.g., Space Pi X4)
 * 
 * AUTO-GENERATED - Run \`npx tsx scripts/scrape-drying-params.ts\` to update
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
${lookupEntries}
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
`;
}

async function main() {
    try {
        const entries = await scrapeDryingParameters();
        console.log(`\nExtracted ${entries.length} filament entries from wiki`);

        // Show what we found
        console.log('\nFilament types found:');
        for (const entry of entries) {
            console.log(`  ${entry.filamentType}: ${entry.ovenTemp}°C, ${entry.ovenDuration}h`);
        }

        // Generate TypeScript file
        const tsContent = generateTypeScriptFile(entries);

        // Write to dryingParameters.ts
        const outputPath = path.join(__dirname, '..', 'src', 'data', 'dryingParameters.ts');
        fs.writeFileSync(outputPath, tsContent, 'utf-8');

        console.log(`\n✅ Generated ${outputPath}`);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
