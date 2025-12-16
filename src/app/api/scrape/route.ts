import { NextResponse } from 'next/server';
import { gotScraping } from 'got-scraping';
import * as cheerio from 'cheerio';
import { scrapeCache, getCacheKey } from '@/lib/cache';
import { extractFilamentType, getDryingParameters } from '@/data/dryingParameters';

export const runtime = 'nodejs'; // Must be nodejs for got-scraping

// TypeScript interfaces for the JSON-LD structured data
interface JsonLdOffer {
  '@type': string;
  url?: string;
}

interface JsonLdVariant {
  '@type': string;
  sku?: string;
  name?: string;
  image?: string;
  offers?: JsonLdOffer;
}

interface JsonLdProductGroup {
  '@type': string;
  name?: string;
  hasVariant?: JsonLdVariant[];
}

interface JsonLdProduct {
  '@type': string;
  name?: string;
  image?: string;
  sku?: string;
  offers?: JsonLdOffer | JsonLdOffer[];
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Basic validation
    let urlObj: URL;
    try {
      urlObj = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // basic hostname check
    if (!urlObj.hostname.includes('bambulab.com')) {
      return NextResponse.json({
        error: 'Only Bambu Lab store URLs are supported. Please use "Manual Input" for other brands.'
      }, { status: 400 });
    }

    // must be a product page
    if (!urlObj.pathname.includes('/products/')) {
      return NextResponse.json({
        error: 'This does not look like a product page. Please use a URL containing "/products/".'
      }, { status: 400 });
    }

    // Check cache first
    const cacheKey = getCacheKey(url);
    const cachedData = scrapeCache.get(cacheKey);

    if (cachedData) {
      console.log('Cache HIT for:', url);
      return NextResponse.json(cachedData, {
        headers: {
          'X-Cache': 'HIT',
        },
      });
    }

    console.log('Cache MISS for:', url);

    const response = await gotScraping({
      url,
      headerGeneratorOptions: {
        browsers: [{ name: 'chrome', minVersion: 120 }],
        devices: ['desktop'],
        locales: ['en-US'],
      },
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    if (response.statusCode !== 200) {
      return NextResponse.json({ error: `Failed to fetch URL: ${response.statusMessage}` }, { status: response.statusCode });
    }

    const html = response.body;

    // Parse HTML with cheerio
    const $ = cheerio.load(html);

    // Extract meta tags properly
    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || '';
    const titleTag = $('title').text() || '';

    let title = ogTitle || titleTag;
    let image = ogImage;

    // Fallback for Shopify image
    if (!image) {
      const productImg = $('img.product-single__photo').attr('src');
      if (productImg) {
        image = productImg;
      }
    }

    // Clean up image URL
    if (image && image.startsWith('//')) {
      image = 'https:' + image;
    } else if (image && image.startsWith('/')) {
      image = `${urlObj.origin}${image}`;
    }

    // Remove " | Bambu Lab US" etc from title if present
    title = title.replace(/\s*\|\s*Bambu Lab.*/i, '').trim();

    // Extract variant ID from URL
    const variantId = urlObj.searchParams.get('variant') || urlObj.searchParams.get('id');

    // Check for base64-encoded `p` parameter (alternative URL format from Bambu Lab)
    // Format: ?p=base64([{"propertyKey":"Color","propertyValue":"Neon Green (53500)"},{"propertyKey":"Type","propertyValue":""},{"propertyKey":"Size","propertyValue":"1 kg"}])
    const pParam = urlObj.searchParams.get('p');
    let pParamColor = '';
    let pParamSize = '';

    if (pParam) {
      try {
        const decoded = Buffer.from(pParam, 'base64').toString('utf-8');
        const properties = JSON.parse(decoded) as Array<{ propertyKey: string; propertyValue: string }>;

        for (const prop of properties) {
          if (prop.propertyKey === 'Color' && prop.propertyValue) {
            pParamColor = prop.propertyValue;
            console.log('Extracted color from p parameter:', pParamColor);
          }
          if (prop.propertyKey === 'Size' && prop.propertyValue) {
            pParamSize = prop.propertyValue;
            console.log('Extracted size from p parameter:', pParamSize);
          }
        }
      } catch (e) {
        console.error('Failed to parse p parameter:', e);
      }
    }

    console.log('Scrape Request:', { url, variantId, pParamColor, pParamSize });

    // Validation - User must select a variant (via id/variant param OR p param with color)
    if (!variantId && !pParamColor) {
      return NextResponse.json({
        error: 'Please select a specific color/option on the Bambu Lab page, then copy the URL (it should have a ?variant=... or ?id=... part, or a ?p=... part).'
      }, { status: 400 });
    }

    // Extract and parse JSON-LD structured data
    let color = pParamColor; // Start with color from p param if available
    let colorImage = '';

    // Find all JSON-LD script tags
    const jsonLdScripts = $('script[type="application/ld+json"]');

    jsonLdScripts.each((_, el) => {
      if (color) return; // Already found, stop searching

      try {
        const jsonText = $(el).html();
        if (!jsonText) return;

        const data = JSON.parse(jsonText) as JsonLdProductGroup | JsonLdProduct;

        // Handle ProductGroup schema (most common for Bambu Lab products)
        if (data['@type'] === 'ProductGroup' && 'hasVariant' in data) {
          const variants = data.hasVariant || [];

          for (const variant of variants) {
            // Match variant by SKU (which is the variant ID in the URL)
            if (variant.sku === variantId) {
              console.log('Found matching variant in JSON-LD ProductGroup:', variant.name);

              // Extract color from the variant name
              // Format: "PC FR - White (63101) / Filament with spool / 1 kg"
              if (variant.name) {
                const colorMatch = variant.name.match(/- ([^/]+(?:\([^)]+\))?)\s*\//);
                if (colorMatch) {
                  color = colorMatch[1].trim();
                  console.log('Extracted color from JSON-LD:', color);
                }
              }

              // Use the variant-specific image
              if (variant.image) {
                image = variant.image;
                console.log('Found variant-specific image:', image);
              }

              break;
            }
          }
        }

        // Fallback: Handle direct Product schema
        if (!color && data['@type'] === 'Product') {
          const product = data as JsonLdProduct;
          if (product.sku === variantId && product.name) {
            const colorMatch = product.name.match(/- ([^/]+(?:\([^)]+\))?)\s*\//);
            if (colorMatch) {
              color = colorMatch[1].trim();
            }
            if (product.image) {
              image = product.image;
            }
          }
        }
      } catch (e) {
        console.error('Error parsing JSON-LD:', e);
      }
    });

    // Fallback: Try parsing Next.js hydration data if JSON-LD didn't work
    if (!color) {
      console.log('JSON-LD extraction failed, trying Next.js data fallback...');

      // Look for Next.js script tags that contain product data
      $('script').each((_, el) => {
        if (color) return;

        const scriptContent = $(el).html();
        if (!scriptContent || !variantId || !scriptContent.includes(variantId)) return;

        // Try to find JSON objects in the script content
        // Next.js often embeds data as: self.__next_f.push([1,"...escaped JSON..."])
        try {
          // Look for the variant ID and extract nearby value field
          // This is a simplified fallback - the JSON-LD approach is preferred
          const valueMatch = scriptContent.match(new RegExp(
            `"id"\\s*:\\s*"${variantId}"[^}]*"value"\\s*:\\s*"([^"]+)"`,
            'i'
          ));

          if (valueMatch) {
            color = valueMatch[1];
            console.log('Extracted color from Next.js data (fallback):', color);
          }
        } catch (e) {
          // Ignore parsing errors in fallback
        }
      });
    }

    // Fetch image as base64
    let imageBase64 = '';
    if (image) {
      try {
        const imgRes = await gotScraping({
          url: image,
          responseType: 'buffer',
          headerGeneratorOptions: {
            browsers: [{ name: 'chrome', minVersion: 120 }],
            devices: ['desktop'],
            locales: ['en-US'],
          }
        });

        if (imgRes.statusCode === 200) {
          const base64 = imgRes.body.toString('base64');
          const mime = imgRes.headers['content-type'] || 'image/jpeg';
          imageBase64 = `data:${mime};base64,${base64}`;
        }
      } catch (e) {
        console.error('Failed to fetch image for base64', e);
      }
    }

    // Validation: Ensure it's likely a filament
    const titleLower = title.toLowerCase();
    const isFilament =
      titleLower.includes('filament') ||
      titleLower.includes('pla') ||
      titleLower.includes('petg') ||
      titleLower.includes('abs') ||
      titleLower.includes('asa') ||
      titleLower.includes('tpu') ||
      titleLower.includes('pc') ||
      titleLower.includes('pa') ||
      titleLower.includes('pva') ||
      color !== '';

    if (!isFilament) {
      return NextResponse.json({
        error: `The product "${title}" does not appear to be a filament. This tool is designed for generating filament labels.`
      }, { status: 400 });
    }

    // Auto-detect drying parameters
    const filamentType = extractFilamentType(title);
    const dryingParams = filamentType ? getDryingParameters(filamentType) : undefined;

    const responseData = {
      title: title.trim(),
      image,
      imageBase64,
      source: new URL(url).hostname,
      url: url,
      color,
      colorImage,
      dryingTemp: dryingParams?.temperature,
      dryingDuration: dryingParams?.duration,
    };

    // Store in cache
    scrapeCache.set(cacheKey, responseData);
    console.log('Cached data for:', url);

    return NextResponse.json(responseData, {
      headers: {
        'X-Cache': 'MISS',
      },
    });

  } catch (error: any) {
    console.error('Scrape error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
