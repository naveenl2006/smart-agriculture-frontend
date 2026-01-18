import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { governmentNewsService } from '../services/services';
import { FiExternalLink, FiRefreshCw, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './GovernmentNews.css';

const GovernmentNews = () => {
    const { t, language } = useLanguage();
    const [news, setNews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchNews();
    }, []);

    useEffect(() => {
        fetchNews(selectedCategory);
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const response = await governmentNewsService.getCategories();
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchNews = async (category = null) => {
        setLoading(true);
        try {
            const response = await governmentNewsService.getNews(category);
            if (response.success) {
                setNews(response.data);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            toast.error(t('govNews.fetchError') || 'Failed to load government links');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const response = await governmentNewsService.refreshNews();
            if (response.success) {
                setNews(response.data);
                toast.success(t('govNews.refreshSuccess') || 'Links refreshed successfully');
            }
        } catch (error) {
            console.error('Error refreshing:', error);
            toast.error(t('govNews.refreshError') || 'Failed to refresh links');
        } finally {
            setRefreshing(false);
        }
    };

    const handleCardClick = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const getCategoryName = (cat) => {
        if (language === 'ta') {
            return cat.nameTamil || cat.name;
        }
        return cat.name;
    };

    const getTitle = (item) => {
        if (language === 'ta') {
            return item.titleTamil || item.title;
        }
        return item.title;
    };

    return (
        <div className="government-news-page">
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">
                        🏛️ {t('govNews.title') || 'Important Government Links'}
                    </h1>
                    <p className="page-subtitle">
                        {t('govNews.subtitle') || 'Official links from Tamil Nadu Agriculture Department'}
                    </p>
                </div>
                <button
                    className="refresh-btn"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    <FiRefreshCw className={refreshing ? 'spin' : ''} />
                    {refreshing ? (t('common.loading') || 'Loading...') : (t('govNews.refresh') || 'Refresh')}
                </button>
            </div>

            {/* Category Filter */}
            <div className="category-filter">
                <FiFilter className="filter-icon" />
                <div className="category-tabs">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {getCategoryName(cat)}
                        </button>
                    ))}
                </div>
            </div>

            {/* News Grid */}
            {loading ? (
                <div className="loading-state">
                    <FiRefreshCw className="spin" />
                    <span>{t('common.loading') || 'Loading...'}</span>
                </div>
            ) : news.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">📋</span>
                    <h3>{t('govNews.noLinks') || 'No links available'}</h3>
                    <p>{t('govNews.tryRefresh') || 'Try refreshing to load the latest links'}</p>
                </div>
            ) : (
                <div className="news-grid">
                    {news.map((item, index) => (
                        <div
                            key={item._id || index}
                            className="news-card"
                            onClick={() => handleCardClick(item.url)}
                        >
                            <div className="card-icon">
                                <span>{item.icon}</span>
                            </div>
                            <div className="card-content">
                                <h3 className="card-title">{getTitle(item)}</h3>
                            </div>
                            <div className="card-arrow">
                                <FiExternalLink />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Source Info */}
            <div className="source-info">
                <div className="source-badge">
                    <span className="source-icon">🏛️</span>
                    <span className="source-text">
                        {t('govNews.source') || 'Source: Tamil Nadu Agriculture Department (tnagrisnet.tn.gov.in)'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default GovernmentNews;
