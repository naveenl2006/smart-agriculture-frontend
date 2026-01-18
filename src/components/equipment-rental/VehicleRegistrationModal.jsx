import { useState, useRef, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { TAMIL_NADU_CITIES } from '../../data/tamilNaduCities';
import { FiUpload, FiX, FiCheck, FiSearch, FiPhone, FiDollarSign } from 'react-icons/fi';
import './VehicleRegistrationModal.css';

const VEHICLE_TYPES = [
    { value: 'tractor', label: 'Tractor' },
    { value: 'harvester', label: 'Harvester' },
    { value: 'rotavator', label: 'Rotavator' },
    { value: 'sprayer', label: 'Sprayer' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const VehicleRegistrationModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        ownerName: '',
        location: '',
        vehicleType: '',
        vehicleNumber: '',
        phoneNumber: '',
        perHourRent: '',
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [citySearch, setCitySearch] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const fileInputRef = useRef(null);
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

    const validateForm = () => {
        const newErrors = {};

        if (!formData.ownerName.trim()) {
            newErrors.ownerName = 'Owner name is required';
        }

        if (!formData.location) {
            newErrors.location = 'Location is required';
        }

        if (!formData.vehicleType) {
            newErrors.vehicleType = 'Vehicle type is required';
        }

        if (!formData.vehicleNumber.trim()) {
            newErrors.vehicleNumber = 'Vehicle number is required';
        } else if (!/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/i.test(formData.vehicleNumber.replace(/\s/g, ''))) {
            newErrors.vehicleNumber = 'Enter valid format (e.g., TN01AB1234)';
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Enter a valid 10-digit phone number';
        }

        if (!formData.perHourRent) {
            newErrors.perHourRent = 'Per hour rent is required';
        } else if (isNaN(formData.perHourRent) || Number(formData.perHourRent) < 0) {
            newErrors.perHourRent = 'Enter a valid positive amount';
        }

        if (!image) {
            newErrors.image = 'Vehicle image is required';
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            setErrors(prev => ({ ...prev, image: 'Only JPEG, PNG, and WebP images are allowed' }));
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
            return;
        }

        setImage(file);
        setImagePreview(URL.createObjectURL(file));
        setErrors(prev => ({ ...prev, image: '' }));
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('ownerName', formData.ownerName.trim());
            submitData.append('location', formData.location);
            submitData.append('vehicleType', formData.vehicleType);
            submitData.append('vehicleNumber', formData.vehicleNumber.replace(/\s/g, '').toUpperCase());
            submitData.append('phoneNumber', formData.phoneNumber.trim());
            submitData.append('perHourRent', formData.perHourRent);
            submitData.append('vehicleImage', image);

            await onSuccess(submitData);

            // Reset form
            setFormData({ ownerName: '', location: '', vehicleType: '', vehicleNumber: '', phoneNumber: '', perHourRent: '' });
            setImage(null);
            setImagePreview(null);
            setCitySearch('');
            setErrors({});
            onClose();
        } catch (error) {
            if (error.response?.data?.message?.includes('already registered')) {
                setErrors(prev => ({ ...prev, vehicleNumber: 'This vehicle number is already registered' }));
            } else {
                setErrors(prev => ({ ...prev, submit: error.response?.data?.message || 'Registration failed. Please try again.' }));
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ ownerName: '', location: '', vehicleType: '', vehicleNumber: '', phoneNumber: '', perHourRent: '' });
        setImage(null);
        setImagePreview(null);
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
            title="🚜 Register My Vehicle"
            size="md"
        >
            <form onSubmit={handleSubmit} className="vehicle-registration-form">
                {errors.submit && (
                    <div className="form-error-banner">{errors.submit}</div>
                )}

                {/* Owner Name */}
                <div className="form-group">
                    <label htmlFor="ownerName">Owner Name *</label>
                    <input
                        type="text"
                        id="ownerName"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleInputChange}
                        placeholder="Enter owner's full name"
                        className={errors.ownerName ? 'error' : ''}
                    />
                    {errors.ownerName && <span className="error-text">{errors.ownerName}</span>}
                </div>

                {/* Location - Searchable Dropdown */}
                <div className="form-group" ref={cityInputRef}>
                    <label htmlFor="location">Location (Tamil Nadu) *</label>
                    <div className="searchable-dropdown">
                        <div className="search-input-wrapper">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                id="location"
                                value={citySearch}
                                onChange={(e) => {
                                    setCitySearch(e.target.value);
                                    setShowCityDropdown(true);
                                    if (formData.location && e.target.value !== formData.location) {
                                        setFormData(prev => ({ ...prev, location: '' }));
                                    }
                                }}
                                onFocus={() => setShowCityDropdown(true)}
                                placeholder="Search city (e.g., Erode)"
                                className={errors.location ? 'error' : ''}
                                autoComplete="off"
                            />
                            {formData.location && (
                                <FiCheck className="selected-icon" />
                            )}
                        </div>
                        {showCityDropdown && filteredCities.length > 0 && (
                            <ul className="city-dropdown">
                                {filteredCities.map(city => (
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

                {/* Vehicle Type */}
                <div className="form-group">
                    <label htmlFor="vehicleType">Vehicle Type *</label>
                    <select
                        id="vehicleType"
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleInputChange}
                        className={errors.vehicleType ? 'error' : ''}
                    >
                        <option value="">Select vehicle type</option>
                        {VEHICLE_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    {errors.vehicleType && <span className="error-text">{errors.vehicleType}</span>}
                </div>

                {/* Vehicle Number */}
                <div className="form-group">
                    <label htmlFor="vehicleNumber">Vehicle Number *</label>
                    <input
                        type="text"
                        id="vehicleNumber"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., TN01AB1234"
                        className={errors.vehicleNumber ? 'error' : ''}
                        style={{ textTransform: 'uppercase' }}
                    />
                    {errors.vehicleNumber && <span className="error-text">{errors.vehicleNumber}</span>}
                </div>

                {/* Phone Number */}
                <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number *</label>
                    <div className="input-with-icon">
                        <FiPhone className="input-icon" />
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            placeholder="e.g., 9876543210"
                            className={errors.phoneNumber ? 'error' : ''}
                            maxLength={10}
                        />
                    </div>
                    {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
                </div>

                {/* Per Hour Rent */}
                <div className="form-group">
                    <label htmlFor="perHourRent">Per Hour Rent (₹) *</label>
                    <div className="input-with-icon">
                        <FiDollarSign className="input-icon" />
                        <input
                            type="number"
                            id="perHourRent"
                            name="perHourRent"
                            value={formData.perHourRent}
                            onChange={handleInputChange}
                            placeholder="e.g., 500"
                            className={errors.perHourRent ? 'error' : ''}
                            min="0"
                        />
                    </div>
                    {errors.perHourRent && <span className="error-text">{errors.perHourRent}</span>}
                </div>

                {/* Vehicle Image */}
                <div className="form-group">
                    <label>Vehicle Image *</label>
                    <p className="field-hint">JPEG, PNG, or WebP (max 5MB)</p>

                    {!imagePreview ? (
                        <div
                            className={`image-upload-area ${errors.image ? 'error' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <FiUpload size={32} />
                            <span>Click to upload vehicle image</span>
                        </div>
                    ) : (
                        <div className="image-preview-container">
                            <img src={imagePreview} alt="Vehicle preview" className="image-preview" />
                            <button type="button" className="remove-image-btn" onClick={removeImage}>
                                <FiX size={16} />
                            </button>
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                    />
                    {errors.image && <span className="error-text">{errors.image}</span>}
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                    <Button type="button" variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={loading}>
                        {loading ? 'Registering...' : 'Register Vehicle'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default VehicleRegistrationModal;
