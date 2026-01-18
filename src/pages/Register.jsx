import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import authService from '../services/authService';
import Button from '../components/common/Button';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiMapPin, FiGlobe } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import { TAMIL_NADU_CITIES } from '../data/tamilNaduCities';
import './Auth.css';

const Register = () => {
    const { setLanguage, t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        location: '',
        language: 'en',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError(t('auth.passwordsNotMatch') || 'Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError(t('auth.passwordTooShort') || 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authService.register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                location: formData.location,
                language: formData.language,
            });
            if (response.success) {
                setLanguage(formData.language);
                login(response.data.user, response.data.token);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || t('auth.registerFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-visual">
                    <div className="visual-content">
                        <GiWheat className="visual-icon" />
                        <h2>{t('auth.joinFarmers')}</h2>
                        <p>{t('auth.startJourney')}</p>
                        <div className="visual-features">
                            <div className="visual-feature">
                                <span className="feature-emoji">🌾</span>
                                <span>{t('auth.freeForever')}</span>
                            </div>
                            <div className="visual-feature">
                                <span className="feature-emoji">🤖</span>
                                <span>{t('home.aiPowered')}</span>
                            </div>
                            <div className="visual-feature">
                                <span className="feature-emoji">📱</span>
                                <span>{t('auth.fullAccess')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="auth-form-container">
                    <div className="auth-header">
                        <Link to="/" className="auth-logo">
                            <img src="/logo.png" alt="AgriNanban" className="auth-logo-img" />
                            <span>AgriNanban</span>
                        </Link>
                        <h1>{t('auth.createAccount')}</h1>
                        <p>{t('auth.personalInfo')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && (
                            <div className="auth-error">
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="name">{t('auth.fullName')} *</label>
                            <div className="input-wrapper">
                                <FiUser className="input-icon" />
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder={t('auth.fullName')}
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">{t('auth.email')} *</label>
                            <div className="input-wrapper">
                                <FiMail className="input-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder={t('auth.emailPlaceholder')}
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">{t('auth.phoneNumber')} ({t('common.optional')})</label>
                            <div className="input-wrapper">
                                <FiPhone className="input-icon" />
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    placeholder="10-digit mobile number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    pattern="[0-9]{10}"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">{t('auth.password')} *</label>
                                <div className="input-wrapper">
                                    <FiLock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        placeholder={t('auth.passwordPlaceholder')}
                                        value={formData.password}
                                        onChange={handleChange}
                                        minLength={6}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">{t('auth.confirmPassword')} *</label>
                                <div className="input-wrapper">
                                    <FiLock className="input-icon" />
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        placeholder={t('auth.confirmPassword')}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">{t('auth.selectYourDistrict')} *</label>
                            <div className="input-wrapper">
                                <FiMapPin className="input-icon" />
                                <select
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    style={{ paddingLeft: '3rem' }}
                                >
                                    <option value="">{t('auth.selectYourDistrict')}</option>
                                    {TAMIL_NADU_CITIES.map((district) => (
                                        <option key={district} value={district}>
                                            {district}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="language">{t('auth.preferredLanguage')} *</label>
                            <div className="input-wrapper">
                                <FiGlobe className="input-icon" />
                                <select
                                    id="language"
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                    required
                                    style={{ paddingLeft: '3rem' }}
                                >
                                    <option value="en">{t('auth.english')}</option>
                                    <option value="ta">{t('auth.tamil')} (Tamil)</option>
                                </select>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            loading={loading}
                        >
                            {t('auth.createAccount')}
                        </Button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            {t('auth.alreadyHaveAccount')}{' '}
                            <Link to="/login">{t('auth.signIn')}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
