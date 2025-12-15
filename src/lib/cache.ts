/**
 * Simple in-memory cache with TTL (Time To Live) and LRU eviction
 * Suitable for serverless/edge deployments
 */

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
    lastAccessed: number;
}

class SimpleCache<T = any> {
    private cache = new Map<string, CacheEntry<T>>();
    private maxSize: number;
    private defaultTTL: number;

    constructor(maxSize = 100, defaultTTL = 24 * 60 * 60 * 1000) { // 24 hours default
        this.maxSize = maxSize;
        this.defaultTTL = defaultTTL;
    }

    /**
     * Get cached data if it exists and hasn't expired
     */
    get(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        // Update last accessed time for LRU
        entry.lastAccessed = Date.now();
        return entry.data;
    }

    /**
     * Set cached data with optional custom TTL
     */
    set(key: string, data: T, ttl?: number): void {
        const expiresAt = Date.now() + (ttl || this.defaultTTL);

        this.cache.set(key, {
            data,
            expiresAt,
            lastAccessed: Date.now(),
        });

        // Evict oldest entries if cache is too large
        if (this.cache.size > this.maxSize) {
            this.evictOldest();
        }
    }

    /**
     * Check if key exists and is not expired
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }

    /**
     * Clear all cached entries
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache statistics for debugging
     */
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            defaultTTL: this.defaultTTL,
        };
    }

    /**
     * Evict the least recently used entry
     */
    private evictOldest(): void {
        let oldestKey: string | null = null;
        let oldestTime = Infinity;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }
}

// Create a singleton instance for the scrape cache
export const scrapeCache = new SimpleCache<any>(100, 24 * 60 * 60 * 1000); // 24 hours

/**
 * Generate a normalized cache key from a URL
 * This ensures consistent cache keys regardless of URL formatting
 */
export function getCacheKey(url: string): string {
    try {
        const urlObj = new URL(url);
        // Normalize by sorting query params
        const params = new URLSearchParams(urlObj.search);
        const sortedParams = Array.from(params.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}=${v}`)
            .join('&');

        return `${urlObj.origin}${urlObj.pathname}${sortedParams ? '?' + sortedParams : ''}`;
    } catch {
        // Fallback to original URL if parsing fails
        return url;
    }
}
