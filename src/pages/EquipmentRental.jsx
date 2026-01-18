import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { equipmentService } from '../services/services';
import { TAMIL_NADU_CITIES } from '../data/tamilNaduCities';
import VehicleRegistrationModal from '../components/equipment-rental/VehicleRegistrationModal';
import { FiTruck, FiMapPin, FiFilter, FiPlus, FiSearch, FiHash, FiX, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './EquipmentRental.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

const EquipmentRental = () => {
    const { t } = useLanguage();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cityFilter, setCityFilter] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contactVisible, setContactVisible] = useState({});
    const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');
    const cityFilterRef = useRef(null);

    const filteredCities = TAMIL_NADU_CITIES.filter(city =>
        city.toLowerCase().includes(citySearch.toLowerCase())
    );

    useEffect(() => { fetchVehicles(); }, []);
    useEffect(() => { fetchVehicles(); }, [cityFilter]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (cityFilterRef.current && !cityFilterRef.current.contains(e.target)) {
                setShowCityDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const params = cityFilter ? { city: cityFilter } : {};
            const response = await equipmentService.getVehicles(params);
            setVehicles(response.data || []);
        } catch (error) {
            console.error(error);
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterVehicle = async (formData) => {
        const response = await equipmentService.registerVehicle(formData);
        toast.success(t('equipment.registerSuccess') || 'Vehicle registered successfully!');
        fetchVehicles();
        return response;
    };

    const handleCitySelect = (city) => {
        setCityFilter(city);
        setCitySearch(city);
        setShowCityDropdown(false);
    };

    const clearCityFilter = () => {
        setCityFilter('');
        setCitySearch('');
    };

    return (
        <div className="equipment-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🚜 {t('nav.equipment')}</h1>
                    <p className="page-subtitle">{t('equipment.subtitle') || 'Rent tractors and farming equipment or register your own vehicle'}</p>
                </div>
                <div className="header-actions">
                    <Button icon={<FiPlus />} onClick={() => setIsModalOpen(true)}>
                        {t('equipment.registerVehicle') || 'Register My Vehicle'}
                    </Button>
                    <Button icon={<FiFilter />} variant="secondary">{t('common.filters') || 'Filters'}</Button>
                </div>
            </div>

            <section className="registered-vehicles-section">
                <div className="section-header">
                    <h2 className="section-title">📋 {t('equipment.registeredVehicles') || 'Registered Vehicles in Tamil Nadu'}</h2>

                    <div className="city-filter-container" ref={cityFilterRef}>
                        <div className="city-filter-input-wrapper">
                            <FiSearch className="filter-search-icon" />
                            <input
                                type="text"
                                value={citySearch}
                                onChange={(e) => {
                                    setCitySearch(e.target.value);
                                    setShowCityDropdown(true);
                                    if (cityFilter && e.target.value !== cityFilter) {
                                        setCityFilter('');
                                    }
                                }}
                                onFocus={() => setShowCityDropdown(true)}
                                placeholder={t('equipment.filterByCity') || 'Filter by city...'}
                                className="city-filter-input"
                            />
                            {cityFilter && (
                                <button className="clear-filter-btn" onClick={clearCityFilter}>
                                    <FiX size={14} />
                                </button>
                            )}
                        </div>
                        {showCityDropdown && filteredCities.length > 0 && (
                            <ul className="city-filter-dropdown">
                                {filteredCities.slice(0, 8).map(city => (
                                    <li
                                        key={city}
                                        onClick={() => handleCitySelect(city)}
                                        className={cityFilter === city ? 'selected' : ''}
                                    >
                                        <FiMapPin size={12} />
                                        {city}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="filter-bar">
                    {['All', 'Tractor', 'Harvester', 'Rotavator', 'Sprayer'].map((type) => (
                        <button
                            key={type}
                            className={`filter-btn ${vehicleTypeFilter === (type === 'All' ? '' : type.toLowerCase()) ? 'active' : ''}`}
                            onClick={() => setVehicleTypeFilter(type === 'All' ? '' : type.toLowerCase())}
                        >
                            {type === 'All' ? (t('common.all') || 'All') : type}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-placeholder">{t('common.loading') || 'Loading vehicles...'}</div>
                ) : vehicles.filter(v => !vehicleTypeFilter || v.vehicleType === vehicleTypeFilter).length > 0 ? (
                    <div className="vehicles-grid">
                        {vehicles.filter(v => !vehicleTypeFilter || v.vehicleType === vehicleTypeFilter).map((vehicle) => (
                            <Card key={vehicle._id} className="vehicle-card" hoverable>
                                <div className="vehicle-image-container">
                                    <img
                                        src={`${API_BASE_URL}${vehicle.imagePath}`}
                                        alt={`${vehicle.vehicleType} - ${vehicle.vehicleNumber}`}
                                        className="vehicle-image"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/300x200?text=Vehicle+Image';
                                        }}
                                    />
                                </div>
                                <div className="vehicle-info">
                                    <h4 className="vehicle-title">{vehicle.ownerName}'s {vehicle.vehicleType}</h4>
                                    <span className="vehicle-type">{vehicle.vehicleType}</span>
                                </div>
                                <div className="vehicle-meta">
                                    <span className="location"><FiMapPin size={14} />{vehicle.location}</span>
                                    <span className="vehicle-number-tag"><FiHash size={14} />{vehicle.vehicleNumber}</span>
                                </div>
                                <div className="vehicle-pricing">
                                    <div className="price">
                                        <span className="amount">₹{vehicle.perHourRent}</span>
                                        <span className="unit">/{t('common.hour') || 'hour'}</span>
                                    </div>
                                </div>
                                {contactVisible[vehicle._id] ? (
                                    <div className="contact-info-box">
                                        <div className="contact-phone">
                                            <FiPhone size={16} />
                                            <a href={`tel:${vehicle.phoneNumber}`}>{vehicle.phoneNumber}</a>
                                        </div>
                                    </div>
                                ) : (
                                    <Button fullWidth onClick={() => setContactVisible(prev => ({ ...prev, [vehicle._id]: true }))}>
                                        {t('equipment.contactOwner') || 'Contact Owner'}
                                    </Button>
                                )}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="no-vehicles-message">
                        <FiTruck size={48} />
                        <h3>{t('equipment.noEquipment') || 'No equipment available'}{cityFilter ? ` in ${cityFilter}` : ''}</h3>
                        <p>
                            {cityFilter
                                ? (t('equipment.tryDifferent') || 'Try selecting a different city or register your own vehicle')
                                : (t('equipment.beFirst') || 'Be the first to register your vehicle in Tamil Nadu!')
                            }
                        </p>
                        <Button onClick={() => setIsModalOpen(true)}>
                            {t('equipment.registerVehicle') || 'Register My Vehicle'}
                        </Button>
                    </div>
                )}
            </section>

            <VehicleRegistrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleRegisterVehicle}
            />
        </div>
    );
};

export default EquipmentRental;
