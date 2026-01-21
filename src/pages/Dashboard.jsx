import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/common/Card';
import {
    FiDroplet, FiSun, FiTrendingUp, FiTrendingDown, FiAlertCircle,
    FiArrowRight, FiCalendar, FiActivity, FiCloud, FiFileText,
    FiTruck, FiUsers, FiCamera, FiGrid, FiClock,
    FiCheckCircle, FiZap, FiWifi, FiWifiOff
} from 'react-icons/fi';
import { GiPlantRoots, GiWheat, GiFarmTractor } from 'react-icons/gi';
import {
    marketService,
    irrigationService,
    governmentNewsService,
    iotService,
    cropScheduleService,
    weatherService
} from '../services/services';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const { t } = useLanguage();

    // State for all dynamic data
    const [marketPrices, setMarketPrices] = useState([]);
    const [recentNews, setRecentNews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dynamic stats state
    const [activeCropsCount, setActiveCropsCount] = useState(0);
    const [soilMoistureData, setSoilMoistureData] = useState(null);
    const [hasIoTDevices, setHasIoTDevices] = useState(false);
    const [currentTemperature, setCurrentTemperature] = useState(null);
    const [irrigationSchedulesCount, setIrrigationSchedulesCount] = useState(0);
    const [activeSchedulesCount, setActiveSchedulesCount] = useState(0);

    // Activities and tasks
    const [recentActivities, setRecentActivities] = useState([]);
    const [todaysTasks, setTodaysTasks] = useState([]);
    const [weatherAlerts, setWeatherAlerts] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [
                pricesRes,
                newsRes,
                schedulesRes,
                iotRes,
                cropSchedulesRes,
                weatherRes,
                weatherAlertsRes,
                remindersRes
            ] = await Promise.all([
                marketService.getTodayPrices().catch(() => ({ data: { prices: [] } })),
                governmentNewsService.getNews().catch(() => ({ data: { news: [] } })),
                irrigationService.getSchedules().catch(() => ({ data: [] })),
                iotService.getRealtimeSensors().catch(() => ({ success: false, data: { sensors: [] } })),
                cropScheduleService.getSchedules('active').catch(() => ({ success: false, count: 0, data: [] })),
                weatherService.getCurrentWeather().catch(() => ({ success: false, data: null })),
                weatherService.getAlerts().catch(() => ({ success: false, data: { alerts: [] } })),
                cropScheduleService.getReminders().catch(() => ({ success: false, data: [] })),
            ]);

            // Market prices
            setMarketPrices(pricesRes.data?.prices?.slice(0, 4) || []);

            // Government news
            setRecentNews(newsRes.data?.news?.slice(0, 3) || []);

            // Irrigation schedules
            const irrigationData = schedulesRes.data || [];
            setIrrigationSchedulesCount(irrigationData.length);
            setActiveSchedulesCount(irrigationData.filter(s => s.isActive).length);

            // IoT sensor data
            const sensors = iotRes.data?.sensors || [];
            setHasIoTDevices(sensors.length > 0);
            const soilMoistureSensor = sensors.find(s => s.sensorType === 'soil_moisture');
            setSoilMoistureData(soilMoistureSensor || null);

            // Active crops count
            setActiveCropsCount(cropSchedulesRes.count || 0);

            // Weather data
            if (weatherRes.success && weatherRes.data?.current) {
                setCurrentTemperature(weatherRes.data.current);
            }

            // Weather alerts
            if (weatherAlertsRes.success && weatherAlertsRes.data?.alerts) {
                setWeatherAlerts(weatherAlertsRes.data.alerts.slice(0, 3));
            }

            // Today's tasks from reminders
            if (remindersRes.success && remindersRes.data) {
                const tasks = remindersRes.data.slice(0, 5).map(reminder => ({
                    task: `${reminder.activityName} - ${reminder.cropName}`,
                    completed: false,
                    isOverdue: reminder.isOverdue,
                    isToday: reminder.isToday,
                    scheduleId: reminder.scheduleId
                }));
                setTodaysTasks(tasks);
            }

            // Generate recent activities from various sources
            generateRecentActivities(cropSchedulesRes.data || [], irrigationData, weatherAlertsRes.data?.alerts || []);

        } catch (error) {
            console.error('Dashboard data fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Generate recent activities from user data
    const generateRecentActivities = (cropSchedules, irrigationSchedules, alerts) => {
        const activities = [];

        // Add crop-related activities
        cropSchedules.slice(0, 2).forEach(schedule => {
            activities.push({
                type: 'crop',
                message: `Tracking ${schedule.cropName} - ${schedule.progressPercentage || 0}% complete`,
                time: getRelativeTime(schedule.updatedAt || schedule.createdAt),
                icon: <GiPlantRoots />,
                color: '#22c55e'
            });
        });

        // Add irrigation activities
        irrigationSchedules.slice(0, 2).forEach(schedule => {
            if (schedule.isActive) {
                activities.push({
                    type: 'irrigation',
                    message: `Irrigation schedule: ${schedule.name || 'Zone'} - ${schedule.time || 'Scheduled'}`,
                    time: getRelativeTime(schedule.updatedAt || schedule.createdAt),
                    icon: <FiDroplet />,
                    color: '#06b6d4'
                });
            }
        });

        // Add weather alerts
        alerts.slice(0, 2).forEach(alert => {
            activities.push({
                type: 'alert',
                message: alert.title || alert.message,
                time: getRelativeTime(alert.createdAt),
                icon: <FiCloud />,
                color: alert.severity === 'high' ? '#ef4444' : '#f59e0b'
            });
        });

        // Sort by time (most recent first) and limit
        setRecentActivities(activities.slice(0, 4));
    };

    // Helper to get relative time
    const getRelativeTime = (dateString) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    // Current date and time for greeting
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

    // Dynamic stats cards (no livestock)
    const statsCards = [
        {
            title: t('dashboard.activeCrops') || 'Active Crops',
            value: activeCropsCount.toString(),
            change: activeCropsCount > 0 ? `${activeCropsCount} being tracked` : 'No crops yet',
            trend: activeCropsCount > 0 ? 'up' : 'stable',
            icon: <GiPlantRoots size={24} />,
            color: 'green',
            link: '/crops/tracking'
        },
        {
            title: t('dashboard.soilMoisture') || 'Soil Moisture',
            value: hasIoTDevices && soilMoistureData
                ? `${soilMoistureData.value?.toFixed(0) || '--'}%`
                : '--',
            change: hasIoTDevices
                ? (soilMoistureData?.status || 'Checking...')
                : 'No IoT devices',
            trend: hasIoTDevices ? 'stable' : 'warning',
            icon: hasIoTDevices ? <FiWifi size={24} /> : <FiWifiOff size={24} />,
            color: 'blue',
            link: '/irrigation'
        },
        {
            title: t('dashboard.temperature') || 'Temperature',
            value: currentTemperature
                ? `${currentTemperature.temperature}°C`
                : '--°C',
            change: currentTemperature?.condition || 'Loading...',
            trend: 'stable',
            icon: <FiSun size={24} />,
            color: 'orange',
            link: '/weather/alerts'
        },
        {
            title: 'Irrigation Schedules',
            value: irrigationSchedulesCount.toString(),
            change: `${activeSchedulesCount} Active`,
            trend: irrigationSchedulesCount > 0 ? 'stable' : 'warning',
            icon: <FiCalendar size={24} />,
            color: 'cyan',
            link: '/irrigation'
        },
        {
            title: 'Market Trend',
            value: marketPrices.length > 0 ? `₹${marketPrices[0]?.price?.modal || marketPrices[0]?.price || '--'}/kg` : '₹--/kg',
            change: marketPrices.length > 0 ? 'Live prices' : 'No data',
            trend: marketPrices.length > 0 ? 'up' : 'stable',
            icon: <FiTrendingUp size={24} />,
            color: 'purple',
            link: '/market'
        },
    ];

    // All modules for quick access
    const moduleCards = [
        {
            title: 'Crop Recommendation',
            description: 'Get AI-powered crop suggestions',
            path: '/crops/recommend',
            icon: <GiPlantRoots size={28} />,
            color: '#10b981',
            badge: 'AI'
        },
        {
            title: 'Crop Scheduler',
            description: 'Plan your farming activities',
            path: '/crops/schedule',
            icon: <FiCalendar size={28} />,
            color: '#3b82f6',
            badge: null
        },
        {
            title: 'Disease Detection',
            description: 'Scan plants for diseases',
            path: '/diseases/detect',
            icon: <FiCamera size={28} />,
            color: '#ef4444',
            badge: 'AI'
        },
        {
            title: 'Market Prices',
            description: 'Live commodity prices',
            path: '/market',
            icon: <FiTrendingUp size={28} />,
            color: '#8b5cf6',
            badge: 'Live'
        },
        {
            title: 'Weather Alerts',
            description: 'Forecasts & warnings',
            path: '/weather/alerts',
            icon: <FiCloud size={28} />,
            color: '#0ea5e9',
            badge: null
        },
        {
            title: 'Government News',
            description: 'Schemes & subsidies',
            path: '/government-news',
            icon: <FiFileText size={28} />,
            color: '#f59e0b',
            badge: 'New'
        },
        {
            title: 'Seed Availability',
            description: 'Find seeds in your area',
            path: '/seeds',
            icon: <GiWheat size={28} />,
            color: '#84cc16',
            badge: null
        },
        {
            title: 'Farm Setup',
            description: 'Plan your farm layout',
            path: '/farm-setup',
            icon: <GiFarmTractor size={28} />,
            color: '#14b8a6',
            badge: '3D'
        },
        {
            title: 'Irrigation',
            description: 'Smart watering schedules',
            path: '/irrigation',
            icon: <FiDroplet size={28} />,
            color: '#06b6d4',
            badge: 'IoT'
        },
        {
            title: 'Equipment Rental',
            description: 'Rent farm machinery',
            path: '/equipment',
            icon: <FiTruck size={28} />,
            color: '#6366f1',
            badge: null
        },
        {
            title: 'Labor Management',
            description: 'Find & manage workers',
            path: '/labor',
            icon: <FiUsers size={28} />,
            color: '#ec4899',
            badge: null
        },
        {
            title: 'Crop Tracking',
            description: 'Monitor crop growth',
            path: '/crops/tracking',
            icon: <FiActivity size={28} />,
            color: '#22c55e',
            badge: null
        },
    ];

    // Default activities if none available
    const displayActivities = recentActivities.length > 0 ? recentActivities : [
        { type: 'info', message: 'Welcome! Start by adding crops or setting up irrigation.', time: 'Just now', icon: <FiZap />, color: '#8b5cf6' }
    ];

    // Default tasks if none available
    const displayTasks = todaysTasks.length > 0 ? todaysTasks : [
        { task: 'Create your first crop schedule', completed: false },
        { task: 'Set up irrigation schedules', completed: false },
        { task: 'Connect IoT devices for monitoring', completed: false },
    ];

    return (
        <div className="dashboard-page">
            {/* Hero Header */}
            <div className="dashboard-hero">
                <div className="hero-content">
                    <div className="greeting-section">
                        <span className="greeting-label">{greeting}</span>
                        <h1 className="greeting-name">{user?.name?.split(' ')[0] || 'Farmer'}! 👋</h1>
                        <p className="greeting-subtitle">Here's your farm overview for today</p>
                    </div>
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <FiZap className="hero-stat-icon" />
                            <div>
                                <span className="hero-stat-value">12</span>
                                <span className="hero-stat-label">Active Modules</span>
                            </div>
                        </div>
                        <div className="hero-stat">
                            <FiCheckCircle className="hero-stat-icon success" />
                            <div>
                                <span className="hero-stat-value">
                                    {activeCropsCount > 0 ? `${Math.min(100, activeCropsCount * 20)}%` : '--'}
                                </span>
                                <span className="hero-stat-label">Farm Activity</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {statsCards.map((stat, index) => (
                    <Link key={index} to={stat.link} className={`stat-card stat-${stat.color}`}>
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-content">
                            <span className="stat-title">{stat.title}</span>
                            <span className="stat-value">{stat.value}</span>
                            <span className={`stat-change ${stat.trend}`}>
                                {stat.trend === 'up' && <FiTrendingUp size={14} />}
                                {stat.trend === 'down' && <FiTrendingDown size={14} />}
                                {stat.trend === 'warning' && <FiAlertCircle size={14} />}
                                {stat.change}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Module Quick Access */}
            <div className="section-header">
                <h2><FiGrid /> All Modules</h2>
                <span className="section-subtitle">Quick access to all features</span>
            </div>
            <div className="modules-grid">
                {moduleCards.map((module, index) => (
                    <Link key={index} to={module.path} className="module-card">
                        <div className="module-icon" style={{ backgroundColor: `${module.color}15`, color: module.color }}>
                            {module.icon}
                        </div>
                        <div className="module-content">
                            <span className="module-title">{module.title}</span>
                            <span className="module-description">{module.description}</span>
                        </div>
                        {module.badge && (
                            <span className="module-badge" style={{ backgroundColor: module.color }}>
                                {module.badge}
                            </span>
                        )}
                        <FiArrowRight className="module-arrow" />
                    </Link>
                ))}
            </div>

            {/* Dashboard Grid - Activity & Tasks */}
            <div className="dashboard-grid">
                {/* Recent Activity */}
                <Card title="Recent Activity" icon={<FiActivity />}>
                    <div className="activity-list">
                        {displayActivities.map((activity, index) => (
                            <div key={index} className="activity-item">
                                <div className="activity-icon" style={{ backgroundColor: `${activity.color}20`, color: activity.color }}>
                                    {activity.icon}
                                </div>
                                <div className="activity-content">
                                    <span className="activity-message">{activity.message}</span>
                                    <span className="activity-time"><FiClock size={12} /> {activity.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Today's Tasks */}
                <Card title="Today's Tasks" icon={<FiCheckCircle />}>
                    <div className="tasks-list">
                        {displayTasks.map((item, index) => (
                            <div key={index} className={`task-item ${item.completed ? 'completed' : ''} ${item.isOverdue ? 'overdue' : ''}`}>
                                <div className={`task-checkbox ${item.completed ? 'checked' : ''}`}>
                                    {item.completed && <FiCheckCircle />}
                                    {item.isOverdue && !item.completed && <FiAlertCircle />}
                                </div>
                                <span className="task-text">
                                    {item.task}
                                    {item.isToday && <span className="today-badge">Today</span>}
                                    {item.isOverdue && <span className="overdue-badge">Overdue</span>}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="tasks-summary">
                        <span>{displayTasks.filter(t => t.completed).length}/{displayTasks.length} completed</span>
                    </div>
                </Card>

                {/* Market Prices Widget */}
                <Card
                    title={t('dashboard.todaysMarketPrices') || "Today's Market Prices"}
                    headerAction={<Link to="/market" className="view-all-link">View All</Link>}
                >
                    <div className="price-list">
                        {marketPrices.length > 0 ? marketPrices.map((item, index) => (
                            <div key={index} className="price-item">
                                <span className="commodity-name">{item.commodity}</span>
                                <span className="commodity-price">₹{item.price?.modal || item.price}/kg</span>
                                <span className={`price-change ${item.priceChange?.trend === 'up' ? 'up' : 'down'}`}>
                                    {item.priceChange?.trend === 'up' ? '+' : ''}{item.priceChange?.percentage || 0}%
                                </span>
                            </div>
                        )) : (
                            <div className="empty-state-small">
                                <p>No market data available</p>
                                <Link to="/market" className="link-btn">View Market Prices</Link>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Weather Alerts */}
                <Card title="Weather Alerts" icon={<FiAlertCircle />}>
                    <div className="alerts-list">
                        {weatherAlerts.length > 0 ? weatherAlerts.map((alert, index) => (
                            <div key={index} className={`alert-item ${alert.severity || 'info'}`}>
                                <div className="alert-icon">
                                    {alert.severity === 'high' ? '🔴' : alert.severity === 'medium' ? '🟡' : '🔵'}
                                </div>
                                <div className="alert-content">
                                    <strong>{alert.title || 'Weather Alert'}</strong>
                                    <p>{alert.message || alert.description}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state-small">
                                <div className="alert-icon">✅</div>
                                <p>No active weather alerts</p>
                                <span className="text-muted">All clear for your area</span>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
