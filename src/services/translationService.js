/**
 * Translation Service using LibreTranslate API
 * Uses free community instances - no API key required!
 * Perfect for student projects.
 */

// Free community LibreTranslate instances (no API key required)
const FREE_ENDPOINTS = [
    'https://translate.astian.org',
    'https://libretranslate.de',
    'https://translate.argosopentech.com',
];

// Use first endpoint by default, can be overridden via env
const API_URL = import.meta.env.VITE_LIBRETRANSLATE_URL || FREE_ENDPOINTS[0];

// In-memory cache for translations
const translationCache = new Map();

// Cache key generator
const getCacheKey = (text, source, target) => `${source}:${target}:${text}`;

// Load cache from localStorage on init
const loadCacheFromStorage = () => {
    try {
        const stored = localStorage.getItem('translationCache');
        if (stored) {
            const parsed = JSON.parse(stored);
            Object.entries(parsed).forEach(([key, value]) => {
                translationCache.set(key, value);
            });
        }
    } catch (error) {
        console.warn('Failed to load translation cache:', error);
    }
};

// Save cache to localStorage
const saveCacheToStorage = () => {
    try {
        const cacheObj = Object.fromEntries(translationCache);
        localStorage.setItem('translationCache', JSON.stringify(cacheObj));
    } catch (error) {
        console.warn('Failed to save translation cache:', error);
    }
};

// Initialize cache from storage
loadCacheFromStorage();

/**
 * Translate a single text string
 * @param {string} text - Text to translate
 * @param {string} target - Target language code (e.g., 'ta' for Tamil)
 * @param {string} source - Source language code (e.g., 'en' for English)
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, target, source = 'en') => {
    if (!text || text.trim() === '') return text;

    // Check cache first
    const cacheKey = getCacheKey(text, source, target);
    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey);
    }

    // If source and target are the same, return original
    if (source === target) return text;

    try {
        const response = await fetch(`${API_URL}/translate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: source,
                target: target,
                format: 'text',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Translation failed: ${response.status}`);
        }

        const data = await response.json();
        const translatedText = data.translatedText;

        // Cache the result
        translationCache.set(cacheKey, translatedText);
        saveCacheToStorage();

        return translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        // Return original text on error
        return text;
    }
};

/**
 * Translate multiple texts in batch
 * @param {string[]} texts - Array of texts to translate
 * @param {string} target - Target language code
 * @param {string} source - Source language code
 * @returns {Promise<string[]>} - Array of translated texts
 */
export const translateBatch = async (texts, target, source = 'en') => {
    if (!texts || texts.length === 0) return [];

    // If source and target are the same, return original
    if (source === target) return texts;

    // Check which texts need translation (not in cache)
    const results = new Array(texts.length);
    const textsToTranslate = [];
    const indicesToTranslate = [];

    texts.forEach((text, index) => {
        const cacheKey = getCacheKey(text, source, target);
        if (translationCache.has(cacheKey)) {
            results[index] = translationCache.get(cacheKey);
        } else if (!text || text.trim() === '') {
            results[index] = text;
        } else {
            textsToTranslate.push(text);
            indicesToTranslate.push(index);
        }
    });

    // If all texts are cached, return immediately
    if (textsToTranslate.length === 0) {
        return results;
    }

    try {
        const response = await fetch(`${API_URL}/translate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: textsToTranslate,
                source: source,
                target: target,
                format: 'text',
            }),
        });

        if (!response.ok) {
            throw new Error(`Batch translation failed: ${response.status}`);
        }

        const data = await response.json();

        // Handle both single and batch responses
        const translatedTexts = Array.isArray(data.translatedText)
            ? data.translatedText
            : [data.translatedText];

        // Map translations back to results and cache them
        translatedTexts.forEach((translated, i) => {
            const originalIndex = indicesToTranslate[i];
            const originalText = textsToTranslate[i];
            results[originalIndex] = translated;

            // Cache the result
            const cacheKey = getCacheKey(originalText, source, target);
            translationCache.set(cacheKey, translated);
        });

        saveCacheToStorage();
        return results;
    } catch (error) {
        console.error('Batch translation error:', error);
        // Return original texts for failed translations
        indicesToTranslate.forEach((index, i) => {
            results[index] = textsToTranslate[i];
        });
        return results;
    }
};

/**
 * Clear the translation cache
 */
export const clearTranslationCache = () => {
    translationCache.clear();
    localStorage.removeItem('translationCache');
};

export default {
    translateText,
    translateBatch,
    clearTranslationCache,
};
