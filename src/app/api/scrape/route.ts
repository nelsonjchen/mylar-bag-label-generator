import { NextResponse } from 'next/server';



export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Basic validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: response.status });
    }

    const html = await response.text();

    // Regex Extraction Strategy (Edge Safe)
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

    // Fallback for Shopify image (Simple regex for common pattern)
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

    return NextResponse.json({
      title: title.trim(),
      image,
      source: new URL(url).hostname,
      url: url
    });

  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
