import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import authService from '../services/authService';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiLock, FiSave, FiChevronDown, FiGlobe } from 'react-icons/fi';
import './Profile.css';

// Tamil Nadu Districts
const TAMIL_NADU_DISTRICTS = [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
    'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram',
    'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam',
    'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram',
    'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur',
    'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur',
    'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore',
    'Viluppuram', 'Virudhunagar'
];

const Profile = () => {
    const { user, updateUser } = useAuth();
    const { setLanguage, t } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', location: '', language: 'en' });
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Searchable dropdown state
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [filteredDistricts, setFilteredDistricts] = useState(TAMIL_NADU_DISTRICTS);
    const dropdownRef = useRef(null);

    // Fetch fresh user data from API on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await authService.getMe();
                if (response.success && response.data.user) {
                    updateUser(response.data.user);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    // Sync formData and searchTerm with user from context (on mount and when user changes)
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                location: user.location || '',
                language: user.language || 'en'
            });
            setSearchTerm(user.location || '');
        }
    }, [user]);

    // Filter districts based on search term
    useEffect(() => {
        if (searchTerm) {
            const filtered = TAMIL_NADU_DISTRICTS.filter(district =>
                district.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredDistricts(filtered);
        } else {
            setFilteredDistricts(TAMIL_NADU_DISTRICTS);
        }
    }, [searchTerm]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

    const handleDistrictSelect = (district) => {
        setFormData({ ...formData, location: district });
        setSearchTerm(district);
        setIsDropdownOpen(false);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setIsDropdownOpen(true);
    };

    const handleSaveProfile = async () => {
        // Validate location - must be a valid Tamil Nadu district
        if (formData.location && !TAMIL_NADU_DISTRICTS.includes(formData.location)) {
            setMessage({ type: 'error', text: 'Please select a valid Tamil Nadu district' });
            return;
        }

        setLoading(true);
        try {
            const response = await authService.updateProfile(formData);
            const updatedUser = response.data.user;

            // Update context with fresh data from server
            updateUser(updatedUser);

            // Update language context
            if (updatedUser.language) {
                setLanguage(updatedUser.language);
            }

            // Sync local state with updated user (this ensures immediate UI update)
            setFormData({
                name: updatedUser.name || '',
                email: updatedUser.email || '',
                phone: updatedUser.phone || '',
                location: updatedUser.location || '',
                language: updatedUser.language || 'en'
            });
            setSearchTerm(updatedUser.location || '');

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        }
        finally { setLoading(false); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'Passwords do not match' }); return;
        }
        setLoading(true);
        try {
            await authService.changePassword({ currentPassword: passwords.current, newPassword: passwords.new });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) { setMessage({ type: 'error', text: error.response?.data?.message || 'Password change failed' }); }
        finally { setLoading(false); }
    };

    return (
        <div className="profile-page">
            <div className="page-header">
                <h1 className="page-title">👤 {t('profile.title')}</h1>
                <p className="page-subtitle">{t('profile.subtitle')}</p>
            </div>

            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            <div className="profile-layout">
                <Card className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar"><FiUser size={48} /></div>
                        <div className="profile-info">
                            <h2>{user?.name}</h2>
                            <span className="role-badge">{user?.role}</span>
                        </div>
                        <Button icon={<FiEdit2 />} variant="ghost" onClick={() => setIsEditing(!isEditing)}>
                            {isEditing ? 'Cancel' : 'Edit'}
                        </Button>
                    </div>

                    <div className="profile-details">
                        {isEditing ? (
                            <div className="edit-form">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input name="name" value={formData.name} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input name="email" value={formData.email} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Location (Tamil Nadu District)</label>
                                    <div className="searchable-dropdown" ref={dropdownRef}>
                                        <div className="dropdown-input-wrapper">
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={handleSearchChange}
                                                onFocus={() => setIsDropdownOpen(true)}
                                                placeholder="Search district..."
                                                className="dropdown-input"
                                            />
                                            <FiChevronDown className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`} />
                                        </div>
                                        {isDropdownOpen && (
                                            <ul className="dropdown-list">
                                                {filteredDistricts.length > 0 ? (
                                                    filteredDistricts.map((district) => (
                                                        <li
                                                            key={district}
                                                            className={`dropdown-item ${formData.location === district ? 'selected' : ''}`}
                                                            onClick={() => handleDistrictSelect(district)}
                                                        >
                                                            {district}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="dropdown-item no-results">No districts found</li>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Preferred Language</label>
                                    <select
                                        name="language"
                                        value={formData.language}
                                        onChange={handleChange}
                                        className="form-select"
                                    >
                                        <option value="en">English</option>
                                        <option value="ta">தமிழ் (Tamil)</option>
                                    </select>
                                </div>
                                <Button icon={<FiSave />} onClick={handleSaveProfile} loading={loading}>Save Changes</Button>
                            </div>
                        ) : (
                            <div className="details-list">
                                <div className="detail-item"><FiMail /><span>{user?.email}</span></div>
                                <div className="detail-item"><FiPhone /><span>{user?.phone || 'Not set'}</span></div>
                                <div className="detail-item"><FiMapPin /><span>{user?.location || 'Not set'}</span></div>
                                <div className="detail-item"><FiGlobe /><span>{user?.language === 'ta' ? 'தமிழ் (Tamil)' : 'English'}</span></div>
                            </div>
                        )}
                    </div>
                </Card>

                <Card title="Change Password" icon={<FiLock />}>
                    <form onSubmit={handleChangePassword} className="password-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <input type="password" name="current" value={passwords.current} onChange={handlePasswordChange} required />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input type="password" name="new" value={passwords.new} onChange={handlePasswordChange} required minLength={6} />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input type="password" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} required />
                        </div>
                        <Button type="submit" loading={loading}>Update Password</Button>
                        <Link to="/forgot-password" className="forgot-password-link">
                            🔑 Forgot your password? Reset via email
                        </Link>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Profile;

