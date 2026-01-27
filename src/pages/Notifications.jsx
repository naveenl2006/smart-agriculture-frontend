import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '../services/notificationService';
import {
    FiBell, FiCheck, FiCheckCircle, FiRefreshCw, FiFilter,
    FiChevronLeft, FiTrash2, FiClock, FiAlertCircle
} from 'react-icons/fi';
import { WiRain, WiDaySunny, WiThunderstorm } from 'react-icons/wi';
import toast from 'react-hot-toast';
import './Notifications.css';

const Notifications = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all'); // all, unread, weather, crop, market

    // Fetch notifications from API
    const fetchNotifications = useCallback(async (showToast = false) => {
        try {
            setLoading(true);
            const response = await getNotifications();
            if (response.success) {
                setNotifications(response.data.notifications || []);
            }
            if (showToast) {
                toast.success('Notifications refreshed');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchNotifications(true);
        setRefreshing(false);
    };

    // Mark single notification as read
    const markAsRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('Failed to mark as read');
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    // Handle notification click
    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    // Get icon for notification type
    const getNotificationIcon = (type, iconType) => {
        const icons = {
            weather: <WiRain className="type-weather" />,
            crop: '🌾',
            market: '📈',
            default: <FiBell />
        };

        if (iconType === 'critical') return <FiAlertCircle className="icon-critical" />;
        return icons[type] || icons.default;
    };

    // Get icon type class for styling
    const getIconTypeClass = (iconType) => {
        const classes = {
            critical: 'critical',
            warning: 'warning',
            success: 'success',
            info: 'info'
        };
        return classes[iconType] || 'info';
    };

    // Format time ago
    const formatTimeAgo = (time) => {
        if (!time) return '';
        const now = new Date();
        const date = new Date(time);
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        return n.type === filter;
    });

    // Count unread notifications
    const unreadCount = notifications.filter(n => !n.read).length;

    // Group notifications by date
    const groupNotificationsByDate = (notifs) => {
        const groups = {};
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        notifs.forEach(n => {
            const dateStr = new Date(n.createdAt || n.time).toDateString();
            let label = dateStr;

            if (dateStr === today) label = 'Today';
            else if (dateStr === yesterday) label = 'Yesterday';
            else label = new Date(n.createdAt || n.time).toLocaleDateString('en-IN', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            });

            if (!groups[label]) groups[label] = [];
            groups[label].push(n);
        });

        return groups;
    };

    const groupedNotifications = groupNotificationsByDate(filteredNotifications);

    if (loading) {
        return (
            <div className="notifications-page">
                <div className="loading-container">
                    <FiRefreshCw className="spin" size={32} />
                    <span>Loading notifications...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="notifications-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <FiChevronLeft size={20} />
                    </button>
                    <div className="header-text">
                        <h1 className="page-title">
                            <FiBell className="title-icon" />
                            Notifications
                            {unreadCount > 0 && (
                                <span className="unread-badge">{unreadCount}</span>
                            )}
                        </h1>
                        <p className="page-subtitle">
                            Stay updated with alerts and important information
                        </p>
                    </div>
                </div>
                <div className="header-actions">
                    {unreadCount > 0 && (
                        <button className="mark-all-btn" onClick={markAllAsRead}>
                            <FiCheckCircle />
                            Mark all as read
                        </button>
                    )}
                    <button
                        className="refresh-btn"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <FiRefreshCw className={refreshing ? 'spin' : ''} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                        <span className="count">{notifications.length}</span>
                    </button>
                    <button
                        className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        Unread
                        <span className="count">{unreadCount}</span>
                    </button>
                    <button
                        className={`filter-tab ${filter === 'weather' ? 'active' : ''}`}
                        onClick={() => setFilter('weather')}
                    >
                        🌤️ Weather
                    </button>
                    <button
                        className={`filter-tab ${filter === 'crop' ? 'active' : ''}`}
                        onClick={() => setFilter('crop')}
                    >
                        🌾 Crops
                    </button>
                    <button
                        className={`filter-tab ${filter === 'market' ? 'active' : ''}`}
                        onClick={() => setFilter('market')}
                    >
                        📈 Market
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="notifications-container">
                {filteredNotifications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <FiBell size={64} />
                        </div>
                        <h3>No notifications</h3>
                        <p>
                            {filter === 'all'
                                ? "You're all caught up! Check back later for updates."
                                : `No ${filter} notifications at the moment.`}
                        </p>
                    </div>
                ) : (
                    Object.entries(groupedNotifications).map(([date, notifs]) => (
                        <div key={date} className="notification-group">
                            <h3 className="group-date">{date}</h3>
                            <div className="notifications-list">
                                {notifs.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`notification-card ${!notification.read ? 'unread' : ''} ${notification.type || ''}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className={`notification-icon ${getIconTypeClass(notification.iconType)}`}>
                                            {notification.icon || getNotificationIcon(notification.type, notification.iconType)}
                                        </div>
                                        <div className="notification-body">
                                            <div className="notification-header">
                                                <span className={`notification-type ${notification.type}`}>
                                                    {notification.type?.charAt(0).toUpperCase() + notification.type?.slice(1) || 'General'}
                                                </span>
                                                <span className="notification-time">
                                                    <FiClock size={12} />
                                                    {notification.time || formatTimeAgo(notification.createdAt)}
                                                </span>
                                            </div>
                                            <p className="notification-message">{notification.message}</p>
                                            {notification.actionUrl && (
                                                <span className="notification-action">
                                                    Click to view details →
                                                </span>
                                            )}
                                        </div>
                                        {!notification.read && (
                                            <button
                                                className="mark-read-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notification.id);
                                                }}
                                                title="Mark as read"
                                            >
                                                <FiCheck size={16} />
                                            </button>
                                        )}
                                        {!notification.read && <div className="unread-indicator" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
