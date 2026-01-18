import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './LoadingScreen.css';

const LoadingScreen = ({ children, minDuration = 800 }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();
    const { language } = useLanguage();
    const prevPathRef = useRef(location.pathname);
    const prevLanguageRef = useRef(language);

    useEffect(() => {
        const currentPath = location.pathname;
        const prevPath = prevPathRef.current;

        // Determine if we should show loading
        let shouldShowLoading = false;

        // 1. Home -> Dashboard transition
        if (prevPath === '/' && currentPath === '/dashboard') {
            shouldShowLoading = true;
        }

        // 2. Any page -> Profile transition
        if (currentPath === '/profile' && prevPath !== '/profile') {
            shouldShowLoading = true;
        }

        // 3. Any page -> Login transition (Sign In button)
        if (currentPath === '/login' && prevPath !== '/login') {
            shouldShowLoading = true;
        }

        // 4. Any page -> Register transition (Create Account button)
        if (currentPath === '/register' && prevPath !== '/register') {
            shouldShowLoading = true;
        }

        if (shouldShowLoading) {
            setIsLoading(true);
            setIsVisible(true);

            const timer = setTimeout(() => {
                setIsLoading(false);
                setTimeout(() => setIsVisible(false), 300);
            }, minDuration);

            // Update previous path
            prevPathRef.current = currentPath;

            return () => clearTimeout(timer);
        }

        // Update previous path even if not showing loading
        prevPathRef.current = currentPath;
    }, [location.pathname, minDuration]);

    // 3. Language change detection
    useEffect(() => {
        if (prevLanguageRef.current !== language && prevLanguageRef.current !== null) {
            setIsLoading(true);
            setIsVisible(true);

            const timer = setTimeout(() => {
                setIsLoading(false);
                setTimeout(() => setIsVisible(false), 300);
            }, minDuration);

            prevLanguageRef.current = language;

            return () => clearTimeout(timer);
        }

        prevLanguageRef.current = language;
    }, [language, minDuration]);

    return (
        <>
            {isVisible && (
                <div className={`loading-screen ${!isLoading ? 'fade-out' : ''}`}>
                    <div className="loading-content">
                        <div className="loading-logo-container">
                            <img
                                src="/logo.png"
                                alt="AgriNanban"
                                className="loading-logo"
                            />
                            <div className="loading-ring"></div>
                        </div>
                        <div className="loading-text">
                            <span className="loading-title">AgriNanban</span>
                            <span className="loading-tagline">Uzhavanukku Oru Nanban</span>
                        </div>
                        <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            )}
            {children}
        </>
    );
};

export default LoadingScreen;
