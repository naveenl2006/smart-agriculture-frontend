import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import {
    FiCloud, FiDroplet, FiWind, FiSun, FiAlertTriangle,
    FiRefreshCw, FiCheckCircle, FiThermometer, FiMapPin
} from 'react-icons/fi';
import { WiRain, WiDaySunny, WiCloudy, WiThunderstorm, WiFog } from 'react-icons/wi';
import toast from 'react-hot-toast';
import './WeatherAlerts.css';

const WeatherAlerts = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [currentWeather, setCurrentWeather] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [location, setLocation] = useState('');

    // Fetch all weather data
    const fetchWeatherData = useCallback(async (showToast = false) => {
        try {
            setLoading(true);

            // Fetch current weather
            const weatherRes = await api.get('/weather');
            if (weatherRes.data.success) {
                setCurrentWeather(weatherRes.data.data.current);
                setLocation(weatherRes.data.data.location);
                setLastUpdated(new Date(weatherRes.data.data.lastUpdated));
            }

            // Fetch forecast
            const forecastRes = await api.get('/weather/forecast');
            if (forecastRes.data.success) {
                setForecast(forecastRes.data.data.forecast);
            }

            // Fetch alerts
            const alertsRes = await api.get('/weather/alerts');
            if (alertsRes.data.success) {
                setAlerts(alertsRes.data.data.alerts);
                setUnreadCount(alertsRes.data.data.unreadCount);
            }

            if (showToast) {
                toast.success('Weather data updated');
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
            toast.error('Failed to load weather data');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchWeatherData();
    }, [fetchWeatherData]);

    // Manual refresh with cooldown to prevent rate limiting
    const [cooldown, setCooldown] = useState(false);

    const handleRefresh = async () => {
        if (cooldown) {
            toast.error('Please wait before refreshing again');
            return;
        }

        setRefreshing(true);
        try {
            const res = await api.post('/weather/alerts/refresh');
            if (res.data.success) {
                setAlerts(res.data.data.alerts);
                setUnreadCount(res.data.data.unreadCount);
                setLastUpdated(new Date(res.data.data.lastUpdated));
            }
            await fetchWeatherData(true);

            // Set 30-second cooldown after successful refresh
            setCooldown(true);
            setTimeout(() => setCooldown(false), 30000);
        } catch (error) {
            console.error('Error refreshing:', error);
            if (error.response?.status === 429) {
                toast.error('Too many requests. Please wait a minute before refreshing again.');
                setCooldown(true);
                setTimeout(() => setCooldown(false), 60000); // 1 minute cooldown on rate limit
            } else {
                toast.error('Failed to refresh');
            }
        } finally {
            setRefreshing(false);
        }
    };

    // Mark alert as read
    const markAsRead = async (alertId) => {
        try {
            await api.patch(`/weather/alerts/${alertId}/read`);
            setAlerts(prev => prev.map(a =>
                a._id === alertId ? { ...a, isRead: true } : a
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await api.post('/weather/alerts/read-all');
            setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
            setUnreadCount(0);
            toast.success('All alerts marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    // Get weather icon component
    const getWeatherIconComponent = (condition) => {
        const iconMap = {
            'Clear': <WiDaySunny />,
            'Mainly Clear': <WiDaySunny />,
            'Partly Cloudy': <WiCloudy />,
            'Overcast': <WiCloudy />,
            'Cloudy': <WiCloudy />,
            'Light Rain': <WiRain />,
            'Rain': <WiRain />,
            'Heavy Rain': <WiRain />,
            'Light Showers': <WiRain />,
            'Showers': <WiRain />,
            'Heavy Showers': <WiRain />,
            'Drizzle': <WiRain />,
            'Thunderstorm': <WiThunderstorm />,
            'Fog': <WiFog />,
            'Foggy': <WiFog />,
        };
        return iconMap[condition] || <WiDaySunny />;
    };

    // Get alert color class
    const getAlertColorClass = (alertType, severity) => {
        const colorMap = {
            rain: 'alert-blue',
            heavy_rain: 'alert-blue',
            flood: 'alert-yellow',
            drought: 'alert-orange',
            heatwave: 'alert-red',
            wind: 'alert-green'
        };
        return `${colorMap[alertType] || 'alert-blue'} severity-${severity}`;
    };

    // Get alert icon
    const getAlertIcon = (alertType) => {
        const iconMap = {
            rain: '🌧️',
            heavy_rain: '🌧️',
            flood: '🌊',
            drought: '🏜️',
            heatwave: '🔥',
            wind: '💨'
        };
        return iconMap[alertType] || '⚠️';
    };

    // Format time ago
    const formatTimeAgo = (date) => {
        if (!date) return '';
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    if (loading) {
        return (
            <div className="weather-alerts-page">
                <div className="loading-container">
                    <FiRefreshCw className="spin" />
                    <span>Loading weather data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="weather-alerts-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">🌤️ {t('nav.weatherAlerts')}</h1>
                    <p className="page-subtitle">
                        <FiMapPin /> {location || 'Set location in profile'}
                    </p>
                </div>
                <div className="header-actions">
                    <span className="last-updated">
                        Last updated: {formatTimeAgo(lastUpdated)}
                    </span>
                    <button
                        className="refresh-btn"
                        onClick={handleRefresh}
                        disabled={refreshing || cooldown}
                    >
                        <FiRefreshCw className={refreshing ? 'spin' : ''} />
                        {refreshing ? 'Refreshing...' : cooldown ? 'Wait...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Current Weather Card */}
            {currentWeather && (
                <Card className="current-weather-card">
                    <div className="current-weather-content">
                        <div className="weather-main">
                            <div className="weather-icon-large">
                                {getWeatherIconComponent(currentWeather.condition)}
                            </div>
                            <div className="temperature-display">
                                <span className="temp-value">{currentWeather.temperature}</span>
                                <span className="temp-unit">°C</span>
                            </div>
                            <span className="weather-condition">{currentWeather.condition}</span>
                        </div>
                        <div className="weather-details">
                            <div className="detail-item">
                                <FiDroplet className="detail-icon humidity" />
                                <div className="detail-info">
                                    <span className="detail-value">{currentWeather.humidity}%</span>
                                    <span className="detail-label">Humidity</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FiWind className="detail-icon wind" />
                                <div className="detail-info">
                                    <span className="detail-value">{currentWeather.windSpeed} km/h</span>
                                    <span className="detail-label">Wind Speed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* 14-Day Forecast */}
            <div className="forecast-section">
                <h2 className="section-title">📅 14-Day Forecast</h2>
                <div className="forecast-scroll">
                    {forecast.map((day, index) => (
                        <div key={index} className="forecast-card">
                            <span className="forecast-day">{day.dayName}</span>
                            <span className="forecast-date">
                                {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                            </span>
                            <div className="forecast-icon">
                                {getWeatherIconComponent(day.condition)}
                            </div>
                            <div className="forecast-temps">
                                <span className="temp-high">{day.tempMax}°</span>
                                <span className="temp-low">{day.tempMin}°</span>
                            </div>
                            <div className="forecast-rain">
                                <FiDroplet />
                                <span>{day.rainProbability}%</span>
                            </div>
                            {day.precipitation > 0 && (
                                <div className="forecast-precip">
                                    {day.precipitation.toFixed(1)}mm
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Weather Alerts */}
            <div className="alerts-section">
                <div className="section-header">
                    <h2 className="section-title">
                        ⚠️ Weather Alerts
                        {unreadCount > 0 && (
                            <span className="unread-badge">{unreadCount}</span>
                        )}
                    </h2>
                    {unreadCount > 0 && (
                        <button className="mark-all-btn" onClick={markAllAsRead}>
                            <FiCheckCircle /> Mark all as read
                        </button>
                    )}
                </div>

                {alerts.length === 0 ? (
                    <div className="no-alerts">
                        <span className="no-alerts-icon">✅</span>
                        <h3>No Active Alerts</h3>
                        <p>Weather conditions look favorable for your area.</p>
                    </div>
                ) : (
                    <div className="alerts-list">
                        {alerts.map(alert => (
                            <div
                                key={alert._id}
                                className={`alert-card ${getAlertColorClass(alert.alertType, alert.severity)} ${alert.isRead ? 'read' : 'unread'}`}
                                onClick={() => !alert.isRead && markAsRead(alert._id)}
                            >
                                <div className="alert-icon">
                                    {getAlertIcon(alert.alertType)}
                                </div>
                                <div className="alert-content">
                                    <div className="alert-header">
                                        <h4 className="alert-title">{alert.title}</h4>
                                        <span className={`severity-badge ${alert.severity}`}>
                                            {alert.severity}
                                        </span>
                                    </div>
                                    <p className="alert-message">{alert.message}</p>
                                    {alert.recommendation && (
                                        <div className="alert-recommendation">
                                            <strong>💡 Recommendation:</strong> {alert.recommendation}
                                        </div>
                                    )}
                                    <span className="alert-time">
                                        {new Date(alert.createdAt).toLocaleDateString('en-IN', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                {!alert.isRead && (
                                    <div className="unread-indicator" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherAlerts;
