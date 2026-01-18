import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { userService } from '../services/services';
import toast from 'react-hot-toast';
import {
    FiUser, FiLock, FiBell, FiSun, FiMoon, FiGlobe, FiLogOut,
    FiTrash2, FiAlertTriangle, FiSave, FiX, FiCheck, FiEye, FiEyeOff
} from 'react-icons/fi';
import './Settings.css';

const Settings = () => {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    // Profile Settings State
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || ''
    });
    const [profileLoading, setProfileLoading] = useState(false);

    // Password Settings State
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({});

    // Notification Settings State
    const [notifications, setNotifications] = useState({
        emailNotifications: localStorage.getItem('emailNotifications') !== 'false',
        pushNotifications: localStorage.getItem('pushNotifications') !== 'false',
        smsNotifications: localStorage.getItem('smsNotifications') === 'true'
    });

    // Modal States
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Sync profile with user data
    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                location: user.location || ''
            });
        }
    }, [user]);

    // Profile Handlers
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            const response = await userService.updateProfile(profile);
            if (response.data) {
                updateUser({ ...user, ...profile });
                toast.success('Profile updated successfully!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setProfileLoading(false);
        }
    };

    // Password Handlers
    const validatePassword = () => {
        const errors = {};
        if (!passwords.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }
        if (!passwords.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwords.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
        setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!validatePassword()) return;

        setPasswordLoading(true);
        try {
            await userService.changePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            toast.success('Password changed successfully!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    // Notification Handlers
    const handleNotificationToggle = (key) => {
        setNotifications(prev => {
            const newValue = !prev[key];
            localStorage.setItem(key, newValue.toString());
            return { ...prev, [key]: newValue };
        });
        toast.success('Notification preference updated');
    };

    // Theme Handler
    const handleThemeToggle = () => {
        toggleTheme();
        toast.success(`Switched to ${isDarkMode ? 'light' : 'dark'} mode`);
    };

    // Language Handler
    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        toast.success(`Language changed to ${newLang === 'en' ? 'English' : 'தமிழ்'}`);
    };

    // Account Actions
    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const handleDeactivateAccount = async () => {
        setActionLoading(true);
        try {
            await userService.deactivateAccount();
            toast.success('Account deactivated');
            logout();
            navigate('/');
        } catch (error) {
            toast.error('Failed to deactivate account');
        } finally {
            setActionLoading(false);
            setShowDeactivateModal(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') {
            toast.error('Please type DELETE to confirm');
            return;
        }
        setActionLoading(true);
        try {
            await userService.deleteAccount();
            toast.success('Account deleted permanently');
            logout();
            navigate('/');
        } catch (error) {
            toast.error('Failed to delete account');
        } finally {
            setActionLoading(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1>⚙️ {t('common.settings') || 'Settings'}</h1>
                <p>{t('settings.subtitle') || 'Manage your account preferences and settings'}</p>
            </div>

            <div className="settings-grid">
                {/* Profile Settings */}
                <section className="settings-section">
                    <div className="section-header">
                        <FiUser className="section-icon" />
                        <h2>{t('settings.profileSettings') || 'Profile Settings'}</h2>
                    </div>
                    <form onSubmit={handleProfileSubmit} className="settings-form">
                        <div className="form-group">
                            <label htmlFor="name">{t('auth.name') || 'Name'}</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={profile.name}
                                onChange={handleProfileChange}
                                placeholder="Enter your name"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">{t('auth.email') || 'Email'}</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={profile.email}
                                onChange={handleProfileChange}
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">{t('auth.phone') || 'Phone Number'}</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={profile.phone}
                                onChange={handleProfileChange}
                                placeholder="Enter your phone number"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="location">{t('auth.location') || 'Location'}</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={profile.location}
                                onChange={handleProfileChange}
                                placeholder="Enter your location"
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={profileLoading}>
                            <FiSave /> {profileLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </section>

                {/* Password Settings */}
                <section className="settings-section">
                    <div className="section-header">
                        <FiLock className="section-icon" />
                        <h2>{t('settings.changePassword') || 'Change Password'}</h2>
                    </div>
                    <form onSubmit={handlePasswordSubmit} className="settings-form">
                        <div className="form-group">
                            <label htmlFor="currentPassword">{t('settings.currentPassword') || 'Current Password'}</label>
                            <div className="password-input">
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={passwords.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter current password"
                                    className={passwordErrors.currentPassword ? 'error' : ''}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                                >
                                    {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {passwordErrors.currentPassword && <span className="error-text">{passwordErrors.currentPassword}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="newPassword">{t('settings.newPassword') || 'New Password'}</label>
                            <div className="password-input">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    id="newPassword"
                                    name="newPassword"
                                    value={passwords.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter new password"
                                    className={passwordErrors.newPassword ? 'error' : ''}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                                >
                                    {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {passwordErrors.newPassword && <span className="error-text">{passwordErrors.newPassword}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">{t('settings.confirmPassword') || 'Confirm Password'}</label>
                            <div className="password-input">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={passwords.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Confirm new password"
                                    className={passwordErrors.confirmPassword ? 'error' : ''}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                                >
                                    {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {passwordErrors.confirmPassword && <span className="error-text">{passwordErrors.confirmPassword}</span>}
                        </div>
                        <button type="submit" className="btn-primary" disabled={passwordLoading}>
                            <FiLock /> {passwordLoading ? 'Updating...' : 'Update Password'}
                        </button>
                        <Link to="/forgot-password" className="forgot-password-link">
                            🔑 {t('auth.forgotPassword') || 'Forgot your password? Reset via email'}
                        </Link>
                    </form>
                </section>

                {/* Notification Settings */}
                <section className="settings-section">
                    <div className="section-header">
                        <FiBell className="section-icon" />
                        <h2>{t('settings.notifications') || 'Notification Settings'}</h2>
                    </div>
                    <div className="toggle-group">
                        <div className="toggle-item">
                            <div className="toggle-info">
                                <span className="toggle-label">{t('settings.emailNotifications') || 'Email Notifications'}</span>
                                <span className="toggle-desc">Receive updates via email</span>
                            </div>
                            <button
                                className={`toggle-switch ${notifications.emailNotifications ? 'active' : ''}`}
                                onClick={() => handleNotificationToggle('emailNotifications')}
                            >
                                <span className="toggle-thumb"></span>
                            </button>
                        </div>
                        <div className="toggle-item">
                            <div className="toggle-info">
                                <span className="toggle-label">{t('settings.pushNotifications') || 'Push Notifications'}</span>
                                <span className="toggle-desc">Receive browser notifications</span>
                            </div>
                            <button
                                className={`toggle-switch ${notifications.pushNotifications ? 'active' : ''}`}
                                onClick={() => handleNotificationToggle('pushNotifications')}
                            >
                                <span className="toggle-thumb"></span>
                            </button>
                        </div>
                        <div className="toggle-item">
                            <div className="toggle-info">
                                <span className="toggle-label">{t('settings.smsNotifications') || 'SMS Notifications'}</span>
                                <span className="toggle-desc">Receive text messages</span>
                            </div>
                            <button
                                className={`toggle-switch ${notifications.smsNotifications ? 'active' : ''}`}
                                onClick={() => handleNotificationToggle('smsNotifications')}
                            >
                                <span className="toggle-thumb"></span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Appearance Settings */}
                <section className="settings-section">
                    <div className="section-header">
                        {isDarkMode ? <FiMoon className="section-icon" /> : <FiSun className="section-icon" />}
                        <h2>{t('settings.appearance') || 'Appearance'}</h2>
                    </div>
                    <div className="toggle-group">
                        <div className="toggle-item theme-toggle">
                            <div className="toggle-info">
                                <span className="toggle-label">{t('settings.darkMode') || 'Dark Mode'}</span>
                                <span className="toggle-desc">Switch between light and dark theme</span>
                            </div>
                            <button
                                className={`toggle-switch ${isDarkMode ? 'active' : ''}`}
                                onClick={handleThemeToggle}
                            >
                                <span className="toggle-thumb">
                                    {isDarkMode ? <FiMoon size={12} /> : <FiSun size={12} />}
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Language Settings */}
                <section className="settings-section">
                    <div className="section-header">
                        <FiGlobe className="section-icon" />
                        <h2>{t('settings.language') || 'Language'}</h2>
                    </div>
                    <div className="form-group">
                        <label htmlFor="language">{t('settings.selectLanguage') || 'Select Language'}</label>
                        <select
                            id="language"
                            value={language}
                            onChange={handleLanguageChange}
                            className="language-select"
                        >
                            <option value="en">🇬🇧 English</option>
                            <option value="ta">🇮🇳 தமிழ் (Tamil)</option>
                        </select>
                    </div>
                </section>

                {/* Account Actions */}
                <section className="settings-section danger-zone">
                    <div className="section-header">
                        <FiAlertTriangle className="section-icon" />
                        <h2>{t('settings.accountActions') || 'Account Actions'}</h2>
                    </div>
                    <div className="action-buttons">
                        <button className="btn-secondary" onClick={handleLogout}>
                            <FiLogOut /> {t('auth.logout') || 'Logout'}
                        </button>
                        <button className="btn-warning" onClick={() => setShowDeactivateModal(true)}>
                            <FiAlertTriangle /> {t('settings.deactivateAccount') || 'Deactivate Account'}
                        </button>
                        <button className="btn-danger" onClick={() => setShowDeleteModal(true)}>
                            <FiTrash2 /> {t('settings.deleteAccount') || 'Delete Account'}
                        </button>
                    </div>
                </section>
            </div>

            {/* Deactivate Modal */}
            {showDeactivateModal && (
                <div className="modal-overlay" onClick={() => setShowDeactivateModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header warning">
                            <FiAlertTriangle size={24} />
                            <h3>Deactivate Account</h3>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to deactivate your account?</p>
                            <p className="modal-note">Your account will be temporarily disabled. You can reactivate it by logging in again.</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowDeactivateModal(false)}>
                                <FiX /> Cancel
                            </button>
                            <button className="btn-warning" onClick={handleDeactivateAccount} disabled={actionLoading}>
                                <FiCheck /> {actionLoading ? 'Processing...' : 'Deactivate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal danger" onClick={e => e.stopPropagation()}>
                        <div className="modal-header danger">
                            <FiTrash2 size={24} />
                            <h3>Delete Account Permanently</h3>
                        </div>
                        <div className="modal-body">
                            <p>This action cannot be undone. All your data will be permanently deleted.</p>
                            <div className="form-group">
                                <label>Type <strong>DELETE</strong> to confirm:</label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder="Type DELETE"
                                    className="delete-confirm-input"
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                                <FiX /> Cancel
                            </button>
                            <button
                                className="btn-danger"
                                onClick={handleDeleteAccount}
                                disabled={actionLoading || deleteConfirmText !== 'DELETE'}
                            >
                                <FiTrash2 /> {actionLoading ? 'Deleting...' : 'Delete Forever'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
