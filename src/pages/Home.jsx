import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/common/Button';
import LanguageToggle from '../components/common/LanguageToggle';
import {
    FiArrowRight, FiCheck, FiDroplet, FiCamera, FiTrendingUp,
    FiTruck, FiUsers, FiCloud, FiCalendar, FiCpu, FiFileText, FiLayout
} from 'react-icons/fi';
import { GiWheat, GiCow, GiPlantRoots } from 'react-icons/gi';
import './Home.css';

const Home = () => {
    const { isAuthenticated } = useAuth();
    const { t } = useLanguage();

    const features = [
        {
            icon: <GiPlantRoots size={32} />,
            title: t('home.cropRecommendation') || 'Crop Recommendation',
            description: t('home.cropRecommendationDesc') || 'AI-powered suggestions based on soil and climate',
            color: 'green',
        },
        {
            icon: <FiCalendar size={32} />,
            title: t('home.cropScheduling') || 'Crop Scheduling & Tracking',
            description: t('home.cropSchedulingDesc') || 'Plan and track your crop activities from planting to harvest',
            color: 'teal',
        },
        {
            icon: <FiCamera size={32} />,
            title: t('home.diseaseDetection') || 'Disease Detection',
            description: t('home.diseaseDetectionDesc') || 'AI-powered plant disease detection using photos',
            color: 'purple',
        },
        {
            icon: <FiTrendingUp size={32} />,
            title: t('home.marketPrices') || 'Market Prices',
            description: t('home.marketPricesDesc') || 'Real-time commodity prices and trends',
            color: 'blue',
        },
        {
            icon: <FiCloud size={32} />,
            title: t('home.weatherAlerts') || 'Weather Alerts',
            description: t('home.weatherAlertsDesc') || 'Real-time weather forecasts and farming alerts',
            color: 'sky',
        },
        {
            icon: <FiDroplet size={32} />,
            title: t('home.smartIrrigation') || 'Smart Irrigation',
            description: t('home.smartIrrigationDesc') || 'Optimize water usage with intelligent scheduling',
            color: 'cyan',
        },
        {
            icon: <FiCpu size={32} />,
            title: t('home.iotSensors') || 'IoT Sensors',
            description: t('home.iotSensorsDesc') || 'Monitor soil moisture, temperature, and humidity in real-time',
            color: 'indigo',
        },
        {
            icon: <FiTruck size={32} />,
            title: t('home.equipmentRental') || 'Equipment Rental',
            description: t('home.equipmentRentalDesc') || 'Find and rent farm equipment near you',
            color: 'orange',
        },
        {
            icon: <FiUsers size={32} />,
            title: t('home.laborHiring') || 'Labor Hiring',
            description: t('home.laborHiringDesc') || 'Connect with skilled agricultural workers',
            color: 'pink',
        },
        {
            icon: <GiCow size={32} />,
            title: t('home.livestockManagement') || 'Livestock Management',
            description: t('home.livestockManagementDesc') || 'Track and manage your livestock health',
            color: 'amber',
        },
        {
            icon: <FiLayout size={32} />,
            title: t('home.farmSetup') || 'Farm Setup',
            description: t('home.farmSetupDesc') || '3D visualization and smart farm planning',
            color: 'emerald',
        },
        {
            icon: <FiFileText size={32} />,
            title: t('home.governmentNews') || 'Government News',
            description: t('home.governmentNewsDesc') || 'Latest agricultural schemes and announcements',
            color: 'red',
        },
    ];

    const stats = [
        { value: '10,000+', label: t('home.farmersRegistered') },
        { value: '50+', label: t('home.cropVarieties') },
        { value: '95%', label: t('home.detectionAccuracy') },
        { value: '24/7', label: t('home.marketUpdates') },
    ];

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-gradient"></div>
                </div>
                <nav className="home-nav">
                    <div className="nav-brand">
                        <img src="/logo.png" alt="AgriNanban" className="nav-logo" />
                        <span>AgriNanban</span>
                    </div>
                    <div className="nav-links">
                        <LanguageToggle />
                        {isAuthenticated ? (
                            <Link to="/dashboard">
                                <Button variant="secondary">{t('home.goToDashboard')}</Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="nav-link">{t('auth.login')}</Link>
                                <Link to="/register">
                                    <Button>{t('auth.register')}</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            {t('home.heroTitle1')}
                            <span className="gradient-text"> {t('home.heroTitle2')}</span>
                        </h1>
                        <p className="hero-subtitle">
                            {t('home.heroSubtitle')}
                        </p>
                        <div className="hero-actions">
                            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                                <Button size="xl" icon={<FiArrowRight />} iconPosition="right">
                                    {t('home.startFree')}
                                </Button>
                            </Link>
                            <Link to="#features">
                                <Button variant="ghost-light" size="xl">
                                    {t('home.exploreFeatures')}
                                </Button>
                            </Link>
                        </div>
                        <div className="hero-badges">
                            <div className="badge"><FiCheck /> {t('home.freeToUse')}</div>
                            <div className="badge"><FiCheck /> {t('home.noCreditCard')}</div>
                            <div className="badge"><FiCheck /> {t('home.aiPowered')}</div>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-card">
                            <div className="card-icon">🌾</div>
                            <div className="card-content">
                                <h4>{t('home.todayRecommendation')}</h4>
                                <p>{t('home.basedOnSoil')}</p>
                                <div className="recommended-crops">
                                    <span className="crop-tag">{t('crops.wheat')}</span>
                                    <span className="crop-tag">{t('crops.mustard')}</span>
                                    <span className="crop-tag">{t('crops.potato')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="hero-card secondary">
                            <div className="card-icon">📈</div>
                            <div className="card-content">
                                <h4>{t('home.tomatoPriceAlert')}</h4>
                                <p className="price-up">+15% ↑ {t('home.fromYesterday')}</p>
                                <span className="price-value">₹38/kg</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-bar">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-item">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="container">
                    <div className="section-header-center">
                        <h2>{t('home.featuresTitle')}</h2>
                        <p>{t('home.featuresSubtitle')}</p>
                    </div>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className={`feature-card feature-${feature.color}`}>
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>{t('home.ctaTitle')}</h2>
                        <p>{t('home.ctaSubtitle')}</p>
                        <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                            <Button size="xl" variant="secondary" icon={<FiArrowRight />} iconPosition="right">
                                {t('home.getStartedFree')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <img src="/logo.png" alt="AgriNanban" className="footer-logo" />
                            <span>AgriNanban</span>
                        </div>
                        <p>{t('home.footerTagline')}</p>
                        <div className="footer-links">
                            <a href="#">{t('home.about')}</a>
                            <a href="#">{t('home.features')}</a>
                            <a href="#">{t('home.contact')}</a>
                            <a href="#">{t('home.privacy')}</a>
                        </div>
                        <p className="copyright">{t('home.copyright')}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
