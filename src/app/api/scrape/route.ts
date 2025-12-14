import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

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
    const $ = cheerio.load(html);

    // Extraction Strategy
    // 1. OG Tags (Standard)
    let title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
    let image = $('meta[property="og:image"]').attr('content') || '';

    // 2. Fallbacks for Bambu Store / Shopify
    // Try to find specific product images if OG fails or if we want high res
    if (!image) {
       // Common Shopify generic selector
       image = $('.product-single__photo img').attr('src') || ''; 
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
