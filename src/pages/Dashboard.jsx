import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/common/Card';
import {
    FiDroplet, FiSun, FiTrendingUp, FiTrendingDown, FiAlertCircle,
    FiArrowRight, FiCalendar, FiActivity, FiCloud, FiFileText,
    FiTruck, FiUsers, FiCamera, FiSettings, FiGrid, FiClock,
    FiCheckCircle, FiZap
} from 'react-icons/fi';
import { GiPlantRoots, GiCow, GiWheat, GiFarmTractor } from 'react-icons/gi';
import { marketService, irrigationService, governmentNewsService } from '../services/services';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [marketPrices, setMarketPrices] = useState([]);
    const [sensorData, setSensorData] = useState([]);
    const [recentNews, setRecentNews] = useState([]);
    const [weatherData, setWeatherData] = useState(null);
    const [irrigationSchedules, setIrrigationSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [pricesRes, sensorsRes, newsRes, schedulesRes] = await Promise.all([
                marketService.getTodayPrices().catch(() => ({ data: { prices: [] } })),
                irrigationService.getSensorData().catch(() => ({ data: { sensors: [] } })),
                governmentNewsService.getNews().catch(() => ({ data: { news: [] } })),
                irrigationService.getSchedules().catch(() => ({ data: [] })),
            ]);
            setMarketPrices(pricesRes.data?.prices?.slice(0, 4) || []);
            setSensorData(sensorsRes.data?.sensors || []);
            setRecentNews(newsRes.data?.news?.slice(0, 3) || []);
            setIrrigationSchedules(schedulesRes.data?.slice(0, 3) || []);
        } catch (error) {
            console.error('Dashboard data fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Current date and time for greeting
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

    // Live stats from sensors
    const statsCards = [
        {
            title: t('dashboard.activeCrops') || 'Active Crops',
            value: '5',
            change: '+2 this season',
            trend: 'up',
            icon: <GiPlantRoots size={24} />,
            color: 'green',
            link: '/crops/tracking'
        },
        {
            title: t('dashboard.soilMoisture') || 'Soil Moisture',
            value: `${sensorData.find(s => s.sensorType === 'soil_moisture')?.value?.toFixed(0) || 62}%`,
            change: 'Optimal Range',
            trend: 'stable',
            icon: <FiDroplet size={24} />,
            color: 'blue',
            link: '/irrigation'
        },
        {
            title: t('dashboard.temperature') || 'Temperature',
            value: `${sensorData.find(s => s.sensorType === 'temperature')?.value?.toFixed(1) || 28}°C`,
            change: 'Normal',
            trend: 'stable',
            icon: <FiSun size={24} />,
            color: 'orange',
            link: '/weather/alerts'
        },
        {
            title: 'Irrigation Schedules',
            value: `${irrigationSchedules.length || 3}`,
            change: `${irrigationSchedules.filter(s => s.isActive).length || 2} Active`,
            trend: 'stable',
            icon: <FiCalendar size={24} />,
            color: 'cyan',
            link: '/irrigation'
        },
        {
            title: t('dashboard.livestock') || 'Livestock',
            value: '24',
            change: '3 need attention',
            trend: 'warning',
            icon: <GiCow size={24} />,
            color: 'amber',
            link: '/farm-setup'
        },
        {
            title: 'Market Trend',
            value: '₹38/kg',
            change: '+5% today',
            trend: 'up',
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

    // Mock recent activities
    const recentActivities = [
        { type: 'irrigation', message: 'Zone A irrigation completed', time: '2 hours ago', icon: <FiDroplet />, color: '#06b6d4' },
        { type: 'alert', message: 'Weather alert: Rain expected tomorrow', time: '3 hours ago', icon: <FiCloud />, color: '#f59e0b' },
        { type: 'market', message: 'Tomato prices increased by 5%', time: '5 hours ago', icon: <FiTrendingUp />, color: '#8b5cf6' },
        { type: 'schedule', message: 'Fertilizer application due for Zone B', time: '6 hours ago', icon: <FiCalendar />, color: '#3b82f6' },
    ];

    // Today's tasks
    const todaysTasks = [
        { task: 'Check soil moisture in Zone C', completed: true },
        { task: 'Apply pesticide to tomato field', completed: false },
        { task: 'Review irrigation schedule', completed: true },
        { task: 'Check market prices for rice', completed: false },
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
                                <span className="hero-stat-value">85%</span>
                                <span className="hero-stat-label">Farm Health</span>
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
                        {recentActivities.map((activity, index) => (
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
                        {todaysTasks.map((item, index) => (
                            <div key={index} className={`task-item ${item.completed ? 'completed' : ''}`}>
                                <div className={`task-checkbox ${item.completed ? 'checked' : ''}`}>
                                    {item.completed && <FiCheckCircle />}
                                </div>
                                <span className="task-text">{item.task}</span>
                            </div>
                        ))}
                    </div>
                    <div className="tasks-summary">
                        <span>{todaysTasks.filter(t => t.completed).length}/{todaysTasks.length} completed</span>
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
                            <>
                                <div className="price-item">
                                    <span className="commodity-name">🍅 Tomato</span>
                                    <span className="commodity-price">₹38/kg</span>
                                    <span className="price-change up">+5%</span>
                                </div>
                                <div className="price-item">
                                    <span className="commodity-name">🧅 Onion</span>
                                    <span className="commodity-price">₹32/kg</span>
                                    <span className="price-change down">-2%</span>
                                </div>
                                <div className="price-item">
                                    <span className="commodity-name">🥔 Potato</span>
                                    <span className="commodity-price">₹28/kg</span>
                                    <span className="price-change up">+3%</span>
                                </div>
                                <div className="price-item">
                                    <span className="commodity-name">🌾 Rice</span>
                                    <span className="commodity-price">₹42/kg</span>
                                    <span className="price-change up">+1%</span>
                                </div>
                            </>
                        )}
                    </div>
                </Card>

                {/* Alerts & Reminders */}
                <Card title="Alerts & Reminders" icon={<FiAlertCircle />}>
                    <div className="alerts-list">
                        <div className="alert-item warning">
                            <div className="alert-icon">⚠️</div>
                            <div className="alert-content">
                                <strong>Low Soil Moisture</strong>
                                <p>Zone C needs irrigation soon</p>
                            </div>
                        </div>
                        <div className="alert-item info">
                            <div className="alert-icon">🌧️</div>
                            <div className="alert-content">
                                <strong>Rain Forecast</strong>
                                <p>Light rain expected tomorrow</p>
                            </div>
                        </div>
                        <div className="alert-item success">
                            <div className="alert-icon">📰</div>
                            <div className="alert-content">
                                <strong>New Subsidy Available</strong>
                                <p>Check Government News for details</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
