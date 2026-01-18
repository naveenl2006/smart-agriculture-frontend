import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
    FiHome, FiGrid, FiDroplet, FiTruck, FiUsers, FiActivity,
    FiTrendingUp, FiCamera, FiSettings, FiHelpCircle, FiChevronDown, FiRefreshCw, FiCloud,
    FiChevronLeft, FiChevronRight, FiFileText
} from 'react-icons/fi';
import { GiWheat, GiPlantRoots } from 'react-icons/gi';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchWeatherByDistrict } from '../../services/weatherService';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);

    // Fetch weather when user's location changes
    useEffect(() => {
        const getWeather = async () => {
            if (user?.location) {
                setWeatherLoading(true);
                try {
                    const data = await fetchWeatherByDistrict(user.location);
                    setWeather(data);
                } catch (error) {
                    console.error('Failed to fetch weather:', error);
                }
                setWeatherLoading(false);
            } else {
                setWeather(null);
            }
        };

        getWeather();

        // Refresh weather every 30 minutes
        const interval = setInterval(getWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, [user?.location]);

    const handleRefreshWeather = async () => {
        if (user?.location && !weatherLoading) {
            setWeatherLoading(true);
            try {
                const data = await fetchWeatherByDistrict(user.location);
                setWeather(data);
            } catch (error) {
                console.error('Failed to fetch weather:', error);
            }
            setWeatherLoading(false);
        }
    };

    const menuItems = [
        {
            title: t('nav.dashboard'),
            icon: FiHome,
            path: '/dashboard'
        },
        {
            title: t('nav.cropRecommendation'),
            icon: GiPlantRoots,
            path: '/crops/recommend'
        },
        {
            title: t('nav.cropScheduler'),
            icon: GiWheat,
            path: '/crops/schedule'
        },
        {
            title: t('nav.cropTracking'),
            icon: FiActivity,
            path: '/crops/tracking'
        },
        {
            title: t('nav.diseaseDetection'),
            icon: FiCamera,
            path: '/diseases/detect'
        },
        {
            title: t('nav.marketPrices'),
            icon: FiTrendingUp,
            path: '/market'
        },
        {
            title: t('nav.weatherAlerts'),
            icon: FiCloud,
            path: '/weather/alerts'
        },
        {
            title: t('nav.governmentNews') || 'Government News',
            icon: FiFileText,
            path: '/government-news'
        },
        {
            title: t('nav.seedAvailability') || 'Seed Availability',
            icon: GiWheat,
            path: '/seeds'
        },
        {
            title: t('nav.farmSetup') || 'Farm Setup',
            icon: GiWheat,
            path: '/farm-setup'
        },
        {
            title: t('nav.equipment'),
            icon: FiTruck,
            path: '/equipment'
        },
        {
            title: t('nav.labor'),
            icon: FiUsers,
            path: '/labor'
        },
        {
            title: t('nav.irrigation'),
            icon: FiDroplet,
            path: '/irrigation'
        },

    ];

    const bottomItems = [
        { title: t('common.settings') || 'Settings', icon: FiSettings, path: '/settings' },
        { title: t('common.help') || 'Help & Support', icon: FiHelpCircle, path: '/help' },
    ];

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-content">
                    <nav className="sidebar-nav">
                        <div className="nav-section">
                            <span className="nav-section-title">{t('common.mainMenu')}</span>
                            {menuItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                    onClick={onClose}
                                >
                                    <item.icon className="nav-icon" />
                                    <span className="nav-text">{item.title}</span>
                                </NavLink>
                            ))}
                        </div>

                        <div className="nav-section">
                            <span className="nav-section-title">Support</span>
                            {bottomItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                    onClick={onClose}
                                >
                                    <item.icon className="nav-icon" />
                                    <span className="nav-text">{item.title}</span>
                                </NavLink>
                            ))}
                        </div>
                    </nav>

                    <div className="sidebar-footer">
                        <div className="weather-widget-mini">
                            {weatherLoading ? (
                                <div className="weather-loading">
                                    <FiRefreshCw className="spin" />
                                    <span>Loading...</span>
                                </div>
                            ) : weather ? (
                                <>
                                    <div className="weather-icon">{weather.icon}</div>
                                    <div className="weather-info">
                                        <span className="temperature">{weather.temperature}°C</span>
                                        <span className="location">{weather.location}, TN</span>
                                    </div>
                                    <button
                                        className="weather-refresh"
                                        onClick={handleRefreshWeather}
                                        title="Refresh weather"
                                    >
                                        <FiRefreshCw />
                                    </button>
                                </>
                            ) : (
                                <div className="weather-empty">
                                    <span className="weather-icon">📍</span>
                                    <div className="weather-info">
                                        <span className="temperature">--°C</span>
                                        <span className="location">Set location in Profile</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

