import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import authService from '../services/authService';
import Button from '../components/common/Button';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.login(formData);
            if (response.success) {
                login(response.data.user, response.data.token);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || t('auth.loginFailed'));
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
                        <h2>{t('auth.welcomeBack')}</h2>
                        <p>{t('auth.accessDashboard')}</p>
                        <div className="visual-features">
                            <div className="visual-feature">
                                <span className="feature-emoji">🌱</span>
                                <span>{t('auth.aiCropRecommendations')}</span>
                            </div>
                            <div className="visual-feature">
                                <span className="feature-emoji">📊</span>
                                <span>{t('auth.realtimeMarketPrices')}</span>
                            </div>
                            <div className="visual-feature">
                                <span className="feature-emoji">💧</span>
                                <span>{t('auth.smartIrrigationControl')}</span>
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
                        <h1>{t('auth.signIn')}</h1>
                        <p>{t('auth.enterCredentials')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && (
                            <div className="auth-error">
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">{t('auth.email')}</label>
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
                            <label htmlFor="password">{t('auth.password')}</label>
                            <div className="input-wrapper">
                                <FiLock className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    placeholder={t('auth.passwordPlaceholder')}
                                    value={formData.password}
                                    onChange={handleChange}
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

                        <div className="form-options">
                            <label className="checkbox-label">
                                <input type="checkbox" />
                                <span>{t('auth.rememberMe')}</span>
                            </label>
                            <Link to="/forgot-password" className="forgot-link">
                                {t('auth.forgotPassword')}
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            loading={loading}
                        >
                            {t('auth.signIn')}
                        </Button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            {t('auth.dontHaveAccount')}{' '}
                            <Link to="/register">{t('auth.createAccount')}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
