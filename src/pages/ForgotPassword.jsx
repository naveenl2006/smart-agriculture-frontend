import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiArrowLeft, FiCheck, FiKey } from 'react-icons/fi';
import api from '../services/api';
import './Auth.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Step 1: Request OTP
    const handleRequestOTP = async (e) => {
        e.preventDefault();

        if (!email) {
            setErrors({ email: 'Email is required' });
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            toast.success('OTP sent to your email!');
            setStep(2);
            setErrors({});
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            setErrors({ otp: 'Please enter a valid 6-digit OTP' });
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/verify-otp', { email, otp });
            toast.success('OTP verified successfully!');
            setStep(3);
            setErrors({});
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!passwords.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (passwords.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                email,
                otp,
                newPassword: passwords.newPassword
            });
            toast.success('Password reset successfully!');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            toast.success('New OTP sent!');
        } catch (error) {
            toast.error('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    {/* Back Link */}
                    <Link to="/login" className="back-link">
                        <FiArrowLeft /> Back to Login
                    </Link>

                    {/* Header */}
                    <div className="auth-header">
                        <div className="auth-logo">🌾</div>
                        <h1>{t('auth.forgotPassword') || 'Forgot Password'}</h1>
                        <p>
                            {step === 1 && "Enter your email to receive a verification code"}
                            {step === 2 && "Enter the 6-digit OTP sent to your email"}
                            {step === 3 && "Create your new password"}
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="password-steps">
                        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                            <div className="step-number">
                                {step > 1 ? <FiCheck /> : '1'}
                            </div>
                            <span>Email</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                            <div className="step-number">
                                {step > 2 ? <FiCheck /> : '2'}
                            </div>
                            <span>Verify</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${step >= 3 ? 'active' : ''}`}>
                            <div className="step-number">3</div>
                            <span>Reset</span>
                        </div>
                    </div>

                    {/* Step 1: Email Form */}
                    {step === 1 && (
                        <form onSubmit={handleRequestOTP} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="email">
                                    <FiMail /> {t('auth.email') || 'Email Address'}
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your registered email"
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && <span className="error-text">{errors.email}</span>}
                            </div>

                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP Form */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="otp">
                                    <FiKey /> Enter OTP
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Enter 6-digit OTP"
                                    className={`otp-input ${errors.otp ? 'error' : ''}`}
                                    maxLength={6}
                                />
                                {errors.otp && <span className="error-text">{errors.otp}</span>}
                            </div>

                            <p className="otp-info">
                                Didn't receive the code?{' '}
                                <button
                                    type="button"
                                    className="resend-btn"
                                    onClick={handleResendOTP}
                                    disabled={loading}
                                >
                                    Resend OTP
                                </button>
                            </p>

                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>

                            <button
                                type="button"
                                className="back-step-btn"
                                onClick={() => setStep(1)}
                            >
                                <FiArrowLeft /> Change Email
                            </button>
                        </form>
                    )}

                    {/* Step 3: New Password Form */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="newPassword">
                                    <FiLock /> New Password
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                                    placeholder="Enter new password"
                                    className={errors.newPassword ? 'error' : ''}
                                />
                                {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">
                                    <FiLock /> Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                                    placeholder="Confirm new password"
                                    className={errors.confirmPassword ? 'error' : ''}
                                />
                                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                            </div>

                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
