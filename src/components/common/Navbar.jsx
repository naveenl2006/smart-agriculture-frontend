import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    FiMenu, FiX, FiUser, FiLogOut, FiBell, FiSearch, FiSun, FiMoon, FiCheck, FiLoader
} from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import LanguageToggle from './LanguageToggle';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/notificationService';
import './Navbar.css';

const Navbar = ({ onMenuClick, isSidebarOpen }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const notificationRef = useRef(null);
    const dropdownRef = useRef(null);

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.read).length;

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            setError(null);
            const response = await getNotifications();
            if (response.success) {
                setNotifications(response.data.notifications || []);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Initial fetch and periodic refresh
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();

            // Refresh notifications every 5 minutes
            const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, fetchNotifications]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Mark single notification as read
    const markAsRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    // Handle notification click - navigate to action URL if present
    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        if (notification.actionUrl) {
            setShowNotifications(false);
            navigate(notification.actionUrl);
        }
    };

    // Get icon type class for styling
    const getIconTypeClass = (iconType) => {
        switch (iconType) {
            case 'critical': return 'critical';
            case 'warning': return 'warning';
            case 'success': return 'success';
            default: return 'info';
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="navbar-brand">
                    <img src="/logo.png" alt="AgriNanban" className="brand-logo" />
                    <span className="brand-text">AgriNanban</span>
                </Link>
            </div>

            <div className="navbar-center">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search crops, diseases, equipment..."
                        className="search-input"
                    />
                </div>
            </div>

            <div className="navbar-right">
                <LanguageToggle />

                <button
                    className="navbar-icon-btn"
                    onClick={toggleTheme}
                    title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                </button>

                {isAuthenticated && (
                    <div className="notification-wrapper" ref={notificationRef}>
                        <button
                            className="navbar-icon-btn"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <FiBell size={20} />
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="notification-dropdown">
                                <div className="notification-header">
                                    <h4>Notifications</h4>
                                    {unreadCount > 0 && (
                                        <button
                                            className="mark-all-read"
                                            onClick={markAllAsRead}
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="notification-list">
                                    {loading ? (
                                        <div className="notification-loading">
                                            <FiLoader className="spin" size={24} />
                                            <span>Loading notifications...</span>
                                        </div>
                                    ) : error ? (
                                        <div className="notification-error">
                                            <span>{error}</span>
                                            <button onClick={fetchNotifications}>Retry</button>
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="notification-empty">
                                            <FiBell size={32} />
                                            <span>No notifications yet</span>
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`notification-item ${!notification.read ? 'unread' : ''} ${notification.type}`}
                                                onClick={() => handleNotificationClick(notification)}
                                            >
                                                <div className={`notification-icon ${getIconTypeClass(notification.iconType)}`}>
                                                    {notification.icon}
                                                </div>
                                                <div className="notification-content">
                                                    <p>{notification.message}</p>
                                                    <span className="notification-time">{notification.time}</span>
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
                                                        <FiCheck size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                                <Link
                                    to="/notifications"
                                    className="view-all-btn"
                                    onClick={() => setShowNotifications(false)}
                                >
                                    View All Notifications
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {isAuthenticated ? (
                    <div className="user-menu-wrapper" ref={dropdownRef}>
                        <button
                            className="user-menu-btn"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <div className="user-avatar">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} />
                                ) : (
                                    <FiUser size={20} />
                                )}
                            </div>
                            <span className="user-name hide-mobile">{user?.name || 'User'}</span>
                        </button>
                        {showDropdown && (
                            <div className="user-dropdown">
                                <div className="dropdown-header">
                                    <div className="user-info">
                                        <strong>{user?.name}</strong>
                                        <span>{user?.email}</span>
                                        <span className="user-role">{user?.role}</span>
                                    </div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                    <FiUser size={18} />
                                    <span>My Profile</span>
                                </Link>
                                <button className="dropdown-item logout" onClick={handleLogout}>
                                    <FiLogOut size={18} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/login" className="btn-login">Login</Link>
                        <Link to="/register" className="btn-register">Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
