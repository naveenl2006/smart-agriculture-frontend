import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import api from '../services/api';
import {
    FiMail, FiMessageSquare, FiSend, FiHelpCircle, FiPhone,
    FiMapPin, FiClock, FiCheckCircle, FiBook, FiUsers, FiShield
} from 'react-icons/fi';
import './Help.css';

const Help = () => {
    const { user } = useAuth();
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const MAX_WORDS = 350;

    const countWords = (text) => {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    };

    const wordCount = countWords(formData.message);
    const isOverLimit = wordCount > MAX_WORDS;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            toast.error('Please fill in all fields');
            return;
        }

        if (isOverLimit) {
            toast.error(`Message exceeds ${MAX_WORDS} word limit`);
            return;
        }

        setLoading(true);
        try {
            await api.post('/support/contact', formData);
            toast.success('Message sent successfully! We will get back to you soon.');
            setSubmitted(true);
            setFormData({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const faqs = [
        {
            question: 'How do I get crop recommendations?',
            answer: 'Go to the Crop Recommendation page, enter your soil and environmental data, and our AI will suggest the best crops for your farm.'
        },
        {
            question: 'How do I detect plant diseases?',
            answer: 'Navigate to Disease Detection, upload a photo of the affected plant, and our AI will identify the disease and suggest treatments.'
        },
        {
            question: 'How do I check market prices?',
            answer: 'Visit the Market Price page to see current prices for vegetables and commodities across Tamil Nadu markets.'
        },
        {
            question: 'How do I change my language preference?',
            answer: 'Go to Settings or your Profile page to switch between English and Tamil (தமிழ்).'
        }
    ];

    return (
        <div className="help-page">
            <div className="help-header">
                <h1>🤝 {t('common.help') || 'Help & Support'}</h1>
                <p>{t('help.subtitle') || 'We\'re here to help you succeed in your farming journey'}</p>
            </div>

            <div className="help-content">
                {/* Contact Form Section */}
                <section className="help-section contact-section">
                    <div className="section-header">
                        <FiMessageSquare className="section-icon" />
                        <h2>Contact Us</h2>
                    </div>

                    {submitted ? (
                        <div className="success-message">
                            <FiCheckCircle size={48} />
                            <h3>Message Sent!</h3>
                            <p>Thank you for reaching out. We'll respond to your inquiry within 24-48 hours.</p>
                            <button className="btn-primary" onClick={() => setSubmitted(false)}>
                                Send Another Message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">
                                        <FiUsers size={14} /> Your Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">
                                        <FiMail size={14} /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">
                                    <FiHelpCircle size={14} /> Subject
                                </label>
                                <select
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select a topic</option>
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Technical Support">Technical Support</option>
                                    <option value="Feature Request">Feature Request</option>
                                    <option value="Bug Report">Bug Report</option>
                                    <option value="Account Issues">Account Issues</option>
                                    <option value="Feedback">Feedback</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">
                                    <FiMessageSquare size={14} /> Your Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Describe your question or issue in detail..."
                                    rows={8}
                                    required
                                />
                                <div className={`word-count ${isOverLimit ? 'error' : ''}`}>
                                    {wordCount} / {MAX_WORDS} words
                                    {isOverLimit && <span className="error-text"> (Exceeds limit)</span>}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary submit-btn"
                                disabled={loading || isOverLimit}
                            >
                                <FiSend /> {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    )}
                </section>

                {/* Contact Info & FAQs */}
                <div className="help-sidebar">
                    {/* Contact Information */}
                    <section className="help-section info-section">
                        <div className="section-header">
                            <FiPhone className="section-icon" />
                            <h2>Contact Info</h2>
                        </div>
                        <div className="contact-info">
                            <div className="info-item">
                                <FiMail />
                                <div>
                                    <strong>Email</strong>
                                    <a href="mailto:naveenlakshmanan.c@gmail.com">naveenlakshmanan.c@gmail.com</a>
                                </div>
                            </div>
                            <div className="info-item">
                                <FiMapPin />
                                <div>
                                    <strong>Location</strong>
                                    <span>Tamil Nadu, India</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <FiClock />
                                <div>
                                    <strong>Response Time</strong>
                                    <span>Within 24-48 hours</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FAQs */}
                    <section className="help-section faq-section">
                        <div className="section-header">
                            <FiBook className="section-icon" />
                            <h2>Quick FAQs</h2>
                        </div>
                        <div className="faq-list">
                            {faqs.map((faq, index) => (
                                <details key={index} className="faq-item">
                                    <summary>{faq.question}</summary>
                                    <p>{faq.answer}</p>
                                </details>
                            ))}
                        </div>
                    </section>

                    {/* Privacy Note */}
                    <div className="privacy-note">
                        <FiShield />
                        <p>Your information is secure and will only be used to respond to your inquiry.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Help;
