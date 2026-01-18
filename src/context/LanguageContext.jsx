import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../translations';
import { useAuth } from './AuthContext';
import { translateText, translateBatch } from '../services/translationService';
import toast from 'react-hot-toast';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
    const { user } = useAuth();
    const [language, setLanguageState] = useState(() => {
        // Check localStorage first, then user preference, default to English
        return localStorage.getItem('language') || 'en';
    });
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationError, setTranslationError] = useState(null);

    // Sync with user's language preference when user changes
    useEffect(() => {
        if (user?.language) {
            setLanguageState(user.language);
            localStorage.setItem('language', user.language);
        }
    }, [user?.language]);

    // Static translation function (uses predefined translations - no API call)
    const t = useCallback((key) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                // Fallback to English if translation not found
                let fallback = translations['en'];
                for (const fk of keys) {
                    if (fallback && fallback[fk] !== undefined) {
                        fallback = fallback[fk];
                    } else {
                        return key; // Return key if not found in fallback
                    }
                }
                return fallback;
            }
        }
        return value;
    }, [language]);

    // Dynamic translation function (uses LibreTranslate API - no key required)
    const translateDynamic = useCallback(async (text) => {
        if (!text || language === 'en') return text;

        setIsTranslating(true);
        setTranslationError(null);

        try {
            const result = await translateText(text, language, 'en');
            return result;
        } catch (error) {
            setTranslationError(error.message);
            toast.error('Translation failed. Using original text.');
            return text;
        } finally {
            setIsTranslating(false);
        }
    }, [language]);

    // Batch dynamic translation
    const translateDynamicBatch = useCallback(async (texts) => {
        if (!texts || texts.length === 0 || language === 'en') return texts;

        setIsTranslating(true);
        setTranslationError(null);

        try {
            const results = await translateBatch(texts, language, 'en');
            return results;
        } catch (error) {
            setTranslationError(error.message);
            toast.error('Translation failed. Using original text.');
            return texts;
        } finally {
            setIsTranslating(false);
        }
    }, [language]);

    // Set language and persist
    const setLanguage = useCallback((newLanguage) => {
        setLanguageState(newLanguage);
        localStorage.setItem('language', newLanguage);
        setTranslationError(null);
    }, []);

    const value = {
        language,
        setLanguage,
        t,
        translateDynamic,
        translateDynamicBatch,
        isTranslating,
        translationError,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;
