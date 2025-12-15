import { NextResponse } from 'next/server';
import { gotScraping } from 'got-scraping';
import { scrapeCache, getCacheKey } from '@/lib/cache';

export const runtime = 'nodejs'; // Must be nodejs for got-scraping

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

    // Regex Extraction Strategy
    const getMetaContent = (prop: string) => {
      const regex = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
      const match = html.match(regex);
      return match ? match[1] : '';
    };

    const getTitleTag = () => {
      const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return match ? match[1] : '';
    };

    let title = getMetaContent('og:title') || getTitleTag() || '';
    let image = getMetaContent('og:image') || '';

    // Fallback for Shopify image
    if (!image) {
      // Look for class="product-single__photo" ... src="..."
      // This is a rough approximation
      const shopifyMatch = html.match(/class=["'][^"']*product-single__photo[^"']*["'][^>]*img[^>]+src=["']([^"']+)["']/i);
      if (shopifyMatch) {
        image = shopifyMatch[1];
      }
    }

    // 3. Clean up
    if (image && image.startsWith('//')) {
      image = 'https:' + image;
    } else if (image && image.startsWith('/')) {
      const urlObj = new URL(url);
      image = `${urlObj.origin}${image}`;
    }

    // Remove " | Bambu Lab US" etc from title if present
    title = title.replace(/\s*\|\s*Bambu Lab.*/i, '').trim();

    let imageBase64 = '';
    if (image) {
      try {
        // Use gotScraping for image too to ensure access
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

    // 4. Extract Color / Variant Info
    let color = '';
    let colorImage = '';
    try {
      const parsedUrl = new URL(url);
      const variantId = parsedUrl.searchParams.get('variant') || parsedUrl.searchParams.get('id');

      console.log('Scrape Request:', { url, variantId });


      // NEW: Validation - User must select a variant
      if (!variantId) {
        return NextResponse.json({
          error: 'Please select a specific color/option on the Bambu Lab page, then copy the URL (it should have a ?variant=... or ?id=... part).'
        }, { status: 400 });
      }

      if (variantId) {
        const escapedIdPattern = `\\\\\"id\\\\\":\\\\\"${variantId}\\\\\"`;
        const variantBlockRegex = new RegExp(`${escapedIdPattern}.*?\\\\\"value\\\\\":\\\\\"([^\\\"]+)\\\\\"`);
        const variantMatch = html.match(variantBlockRegex);

        if (variantMatch) {
          color = variantMatch[1];

          // Try to find colorUrl in the same block (optimistic)
          // It might be after value
          const colorUrlRegex = new RegExp(`${escapedIdPattern}.*?\\\\\"colorUrl\\\\\":\\\\\"([^\\\"]+)\\\\\"`);
          const urlMatch = html.match(colorUrlRegex);
          if (urlMatch) {
            colorImage = urlMatch[1];
          }

          // 4b. Find the MAIN IMAGE for this specific color
          // Strategy: Look for the JSON-LD or Next.js data that links this color name to an image.
          // The data is often inside a JSON string within the script, so quotes are escaped like \"
          try {
            // Escape special regex chars in color (like parentheses)
            // And also escape quotes for the string-in-string matching if needed, though they usually aren't in the value itself.
            const escapedColor = color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            console.log(`Searching for specific image for color: ${color}`);

            // Try the robust double-escaped regex that matches the Next.js hydration data structure
            // Matches: \"mediaFile\":{...\"url\":\"(URL)\"...}...\"propertyValue\":\"(Color)\"
            const escapedMediaRegex = new RegExp(`\\\\\"mediaFile\\\\\":\\{.*?\\\\\"url\\\\\":\\\\\"([^\\\"]+)\\\\\".*?\\}.{0,2000}?\\\\\"propertyValue\\\\\":\\\\\"${escapedColor}\\\\\"`);

            const mediaMatch = html.match(escapedMediaRegex);

            if (mediaMatch) {
              let specificImage = mediaMatch[1];
              if (specificImage.startsWith('http')) {
                console.log('Found specific image (Strategy: Next.js Data):', specificImage);
                image = specificImage;
                imageBase64 = '';
              }
            } else {
              // Fallback: Try JSON-LD style which might be cleaner (unescaped quotes in some blocks)
              // "image":"(URL)","name":"...Color..."
              const imageByColorRegex = new RegExp(`"image":"([^"]+)"[^}]*"name":"[^"]*${escapedColor}[^"]*"`, 'i');
              const imageMatch = html.match(imageByColorRegex);

              if (imageMatch) {
                let specificImage = imageMatch[1];
                if (specificImage.startsWith('http')) {
                  console.log('Found specific image (Strategy: JSON-LD):', specificImage);
                  image = specificImage;
                  imageBase64 = '';
                }
              }
            }
          } catch (err) {
            console.error('Error finding specific image:', err);
          }

        } else {
          const unescapedRegex = new RegExp(`"id":"${variantId}".*?"value":"([^"]+)"`);
          const m2 = html.match(unescapedRegex);
          if (m2) {
            color = m2[1];
          }
        }
      }
    } catch (e) {
      console.error('Error extracting variant:', e);
    }

    // 5. Re-fetch base64 if image changed
    if (image && !imageBase64) {
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
        console.error('Failed to refetch image for base64', e);
      }
    }

    // 6. Validation: Ensure it's likely a filament
    // The user wants to filter out non-filament products (like motors, support pages, etc)
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

    const responseData = {
      title: title.trim(),
      image,
      imageBase64,
      source: new URL(url).hostname,
      url: url,
      color,
      colorImage
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
