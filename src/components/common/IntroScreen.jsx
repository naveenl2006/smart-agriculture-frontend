import { useState, useEffect } from 'react';
import './IntroScreen.css';

const IntroScreen = ({ children, duration = 3000 }) => {
    const [showIntro, setShowIntro] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Check if intro has been shown this session
        const introShown = sessionStorage.getItem('introShown');

        if (introShown) {
            setShowIntro(false);
            return;
        }

        // Start fade out animation before hiding
        const fadeTimer = setTimeout(() => {
            setFadeOut(true);
        }, duration - 500);

        // Hide intro after duration
        const hideTimer = setTimeout(() => {
            setShowIntro(false);
            sessionStorage.setItem('introShown', 'true');
        }, duration);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(hideTimer);
        };
    }, [duration]);

    if (!showIntro) {
        return children;
    }

    return (
        <>
            <div className={`intro-screen ${fadeOut ? 'fade-out' : ''}`}>
                <div className="intro-content">
                    {/* Animated Background Elements */}
                    <div className="intro-particles">
                        <div className="particle"></div>
                        <div className="particle"></div>
                        <div className="particle"></div>
                        <div className="particle"></div>
                        <div className="particle"></div>
                    </div>

                    {/* Animated Leaves */}
                    <div className="intro-leaves">
                        <span className="leaf">🌿</span>
                        <span className="leaf">🌾</span>
                        <span className="leaf">🍃</span>
                        <span className="leaf">🌱</span>
                    </div>

                    {/* Main Logo Animation */}
                    <div className="intro-logo-wrapper">
                        <div className="intro-glow-ring"></div>
                        <div className="intro-glow-ring delay-1"></div>
                        <div className="intro-glow-ring delay-2"></div>
                        <img
                            src="/logo.png"
                            alt="AgriNanban"
                            className="intro-logo"
                        />
                    </div>

                    {/* Title Animation */}
                    <div className="intro-text-container">
                        <h1 className="intro-title">
                            <span className="letter">A</span>
                            <span className="letter">g</span>
                            <span className="letter">r</span>
                            <span className="letter">i</span>
                            <span className="letter">N</span>
                            <span className="letter">a</span>
                            <span className="letter">n</span>
                            <span className="letter">b</span>
                            <span className="letter">a</span>
                            <span className="letter">n</span>
                        </h1>
                        <p className="intro-tagline">Uzhavanukku Oru Nanban</p>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="intro-progress">
                        <div className="intro-progress-bar"></div>
                    </div>
                </div>
            </div>
            {children}
        </>
    );
};

export default IntroScreen;
