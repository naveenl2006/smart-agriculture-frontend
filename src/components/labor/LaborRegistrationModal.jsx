import { useState, useRef, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { TAMIL_NADU_CITIES } from '../../data/tamilNaduCities';
import { FiSearch, FiCheck, FiPhone, FiDollarSign, FiX, FiNavigation, FiMapPin } from 'react-icons/fi';
import './LaborRegistrationModal.css';

const SKILL_OPTIONS = [
    'Harvesting',
    'Ploughing',
    'Sowing',
    'Weeding',
    'Spraying',
    'Irrigation',
    'Threshing',
    'General Farming',
];

const LaborRegistrationModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        location: '',
        latitude: '',
        longitude: '',
        dailyWage: '',
    });
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [citySearch, setCitySearch] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const cityInputRef = useRef(null);

    // Filter cities based on search
    const filteredCities = TAMIL_NADU_CITIES.filter(city =>
        city.toLowerCase().includes(citySearch.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (cityInputRef.current && !cityInputRef.current.contains(e.target)) {
                setShowCityDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get location when modal opens
    useEffect(() => {
        if (isOpen && !formData.latitude && !formData.longitude) {
            getMyLocation();
        }
    }, [isOpen]);

    const getMyLocation = () => {
        if (!navigator.geolocation) {
            setFormData(prev => ({ ...prev, latitude: '11.1271', longitude: '78.6569' }));
            return;
        }
        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6),
                }));
                setGettingLocation(false);
            },
            (error) => {
                console.warn('Geolocation error:', error);
                setGettingLocation(false);
                setFormData(prev => ({ ...prev, latitude: '11.1271', longitude: '78.6569' }));
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
            newErrors.phone = 'Enter a valid 10-digit phone number';
        }

        if (!formData.location) {
            newErrors.location = 'Location is required';
        }

        if (selectedSkills.length === 0) {
            newErrors.skills = 'Select at least one skill';
        }

        if (!formData.dailyWage) {
            newErrors.dailyWage = 'Daily wage is required';
        } else if (isNaN(formData.dailyWage) || Number(formData.dailyWage) < 0) {
            newErrors.dailyWage = 'Enter a valid positive amount';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleCitySelect = (city) => {
        setFormData(prev => ({ ...prev, location: city }));
        setCitySearch(city);
        setShowCityDropdown(false);
        if (errors.location) {
            setErrors(prev => ({ ...prev, location: '' }));
        }
    };

    const toggleSkill = (skill) => {
        setSelectedSkills(prev => {
            if (prev.includes(skill)) {
                return prev.filter(s => s !== skill);
            } else {
                return [...prev, skill];
            }
        });
        if (errors.skills) {
            setErrors(prev => ({ ...prev, skills: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const submitData = {
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                location: {
                    district: formData.location,
                    latitude: parseFloat(formData.latitude) || 11.1271,
                    longitude: parseFloat(formData.longitude) || 78.6569,
                },
                skills: selectedSkills.map(skill => ({ skill, level: 'intermediate' })),
                wages: { daily: Number(formData.dailyWage) },
            };

            await onSuccess(submitData);

            // Reset form
            setFormData({ name: '', phone: '', location: '', dailyWage: '' });
            setSelectedSkills([]);
            setCitySearch('');
            setErrors({});
            onClose();
        } catch (error) {
            setErrors(prev => ({ ...prev, submit: error.response?.data?.message || 'Registration failed. Please try again.' }));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', phone: '', location: '', latitude: '', longitude: '', dailyWage: '' });
        setSelectedSkills([]);
        setCitySearch('');
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="👨‍🌾 Register as Labor"
            size="md"
        >
            <form onSubmit={handleSubmit} className="labor-registration-form">
                {errors.submit && (
                    <div className="form-error-banner">{errors.submit}</div>
                )}

                {/* Name */}
                <div className="form-group">
                    <label htmlFor="laborName">Full Name *</label>
                    <input
                        type="text"
                        id="laborName"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                {/* Phone Number */}
                <div className="form-group">
                    <label htmlFor="laborPhone">Phone Number *</label>
                    <div className="input-with-icon">
                        <FiPhone className="input-icon" />
                        <input
                            type="tel"
                            id="laborPhone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="e.g., 9876543210"
                            className={errors.phone ? 'error' : ''}
                            maxLength={10}
                        />
                    </div>
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>

                {/* Location - Searchable Dropdown */}
                <div className="form-group" ref={cityInputRef}>
                    <label htmlFor="laborLocation">Location (Tamil Nadu) *</label>
                    <div className="searchable-dropdown">
                        <div className="search-input-wrapper">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                id="laborLocation"
                                value={citySearch}
                                onChange={(e) => {
                                    setCitySearch(e.target.value);
                                    setShowCityDropdown(true);
                                    if (formData.location && e.target.value !== formData.location) {
                                        setFormData(prev => ({ ...prev, location: '' }));
                                    }
                                }}
                                onFocus={() => setShowCityDropdown(true)}
                                placeholder="Search city (e.g., Palakkad)"
                                className={errors.location ? 'error' : ''}
                                autoComplete="off"
                            />
                            {formData.location && (
                                <FiCheck className="selected-icon" />
                            )}
                        </div>
                        {showCityDropdown && filteredCities.length > 0 && (
                            <ul className="city-dropdown">
                                {filteredCities.slice(0, 8).map(city => (
                                    <li
                                        key={city}
                                        onClick={() => handleCitySelect(city)}
                                        className={formData.location === city ? 'selected' : ''}
                                    >
                                        {city}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {showCityDropdown && citySearch && filteredCities.length === 0 && (
                            <div className="no-results">No cities found</div>
                        )}
                    </div>
                    {errors.location && <span className="error-text">{errors.location}</span>}
                </div>

                {/* GPS Coordinates */}
                <div className="form-group">
                    <label>GPS Coordinates</label>
                    <div className="coordinates-section">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={getMyLocation}
                            loading={gettingLocation}
                            icon={<FiNavigation />}
                        >
                            {gettingLocation ? 'Getting Location...' : 'Get My Location'}
                        </Button>
                        {formData.latitude && formData.longitude && (
                            <div className="coordinates-hint success">
                                <FiMapPin size={14} />
                                Location: {formData.latitude}, {formData.longitude}
                            </div>
                        )}
                    </div>
                </div>

                {/* Skills */}
                <div className="form-group">
                    <label>Skills *</label>
                    <p className="field-hint">Select all skills that apply</p>
                    <div className="skills-selector">
                        {SKILL_OPTIONS.map(skill => (
                            <button
                                key={skill}
                                type="button"
                                className={`skill-option ${selectedSkills.includes(skill) ? 'selected' : ''}`}
                                onClick={() => toggleSkill(skill)}
                            >
                                {skill}
                                {selectedSkills.includes(skill) && <FiCheck size={14} />}
                            </button>
                        ))}
                    </div>
                    {errors.skills && <span className="error-text">{errors.skills}</span>}
                </div>

                {/* Daily Wage */}
                <div className="form-group">
                    <label htmlFor="dailyWage">Daily Wage (₹) *</label>
                    <div className="input-with-icon">
                        <FiDollarSign className="input-icon" />
                        <input
                            type="number"
                            id="dailyWage"
                            name="dailyWage"
                            value={formData.dailyWage}
                            onChange={handleInputChange}
                            placeholder="e.g., 600"
                            className={errors.dailyWage ? 'error' : ''}
                            min="0"
                        />
                    </div>
                    {errors.dailyWage && <span className="error-text">{errors.dailyWage}</span>}
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                    <Button type="button" variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default LaborRegistrationModal;
