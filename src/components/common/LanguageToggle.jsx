import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './LanguageToggle.css';

const LanguageToggle = () => {
    const { language, setLanguage, isTranslating } = useLanguage();
    const [isHovered, setIsHovered] = useState(false);

    const handleToggle = () => {
        const newLang = language === 'en' ? 'ta' : 'en';
        setLanguage(newLang);
    };

    return (
        <button
            className={`language-toggle ${language === 'ta' ? 'tamil-active' : ''} ${isTranslating ? 'loading' : ''}`}
            onClick={handleToggle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={isTranslating}
            title={language === 'en' ? 'Switch to Tamil' : 'Switch to English'}
            aria-label={`Current language: ${language === 'en' ? 'English' : 'Tamil'}. Click to switch.`}
        >
            <span className={`lang-option ${language === 'en' ? 'active' : ''}`}>
                EN
            </span>
            <span className={`lang-option ${language === 'ta' ? 'active' : ''}`}>
                தமிழ்
            </span>
            <span className="toggle-slider" />
            {isTranslating && (
                <span className="toggle-loader">
                    <span className="loader-dot"></span>
                    <span className="loader-dot"></span>
                    <span className="loader-dot"></span>
                </span>
            )}
        </button>
    );
};

export default LanguageToggle;
