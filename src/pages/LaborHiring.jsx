import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { laborService } from '../services/services';
import { TAMIL_NADU_CITIES } from '../data/tamilNaduCities';
import LaborRegistrationModal from '../components/labor/LaborRegistrationModal';
import { FiUser, FiPhone, FiMapPin, FiFilter, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './LaborHiring.css';

const LaborHiring = () => {
    const { t } = useLanguage();
    const [laborers, setLaborers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contactVisible, setContactVisible] = useState({});
    const [skillFilter, setSkillFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const cityFilterRef = useRef(null);

    const filteredCities = TAMIL_NADU_CITIES.filter(city =>
        city.toLowerCase().includes(citySearch.toLowerCase())
    );

    useEffect(() => { fetchLaborers(); }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (cityFilterRef.current && !cityFilterRef.current.contains(e.target)) {
                setShowCityDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchLaborers = async () => {
        try {
            setLoading(true);
            const response = await laborService.getLaborers({ available: true });
            setLaborers(response.data?.laborers || []);
        } catch (error) {
            console.error(error);
            setLaborers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterLaborer = async (laborData) => {
        const response = await laborService.registerLaborer(laborData);
        toast.success(t('labor.registerSuccess') || 'Registered successfully!');
        fetchLaborers();
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

    const filteredLaborers = laborers.filter(worker => {
        const matchesSkill = !skillFilter || worker.skills?.some(s =>
            s.skill.toLowerCase().includes(skillFilter.toLowerCase())
        );
        const matchesCity = !cityFilter || worker.location?.district === cityFilter;
        return matchesSkill && matchesCity;
    });

    return (
        <div className="labor-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">👨‍🌾 {t('nav.labor')}</h1>
                    <p className="page-subtitle">{t('labor.subtitle') || 'Find and hire skilled agricultural workers or register yourself'}</p>
                </div>
                <div className="header-actions">
                    <Button icon={<FiPlus />} onClick={() => setIsModalOpen(true)}>
                        {t('labor.registerAsLabor') || 'Register as Labor'}
                    </Button>
                    <Button icon={<FiFilter />} variant="secondary">{t('common.filters') || 'Filters'}</Button>
                </div>
            </div>

            <section className="laborers-section">
                <div className="section-header">
                    <h2 className="section-title">📋 {t('labor.availableWorkers') || 'Available Workers'}</h2>

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
                                placeholder={t('labor.filterByCity') || 'Filter by city...'}
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
                    {['All', 'Harvesting', 'Ploughing', 'Sowing', 'Weeding', 'Spraying', 'Irrigation'].map((skill) => (
                        <button
                            key={skill}
                            className={`filter-btn ${skillFilter === (skill === 'All' ? '' : skill) ? 'active' : ''}`}
                            onClick={() => setSkillFilter(skill === 'All' ? '' : skill)}
                        >
                            {skill === 'All' ? (t('common.all') || 'All') : skill}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-placeholder">{t('common.loading') || 'Loading workers...'}</div>
                ) : filteredLaborers.length > 0 ? (
                    <div className="labor-grid">
                        {filteredLaborers.map((worker) => (
                            <Card key={worker._id} className="labor-card" hoverable>
                                <div className="labor-header">
                                    <div className="avatar"><FiUser size={32} /></div>
                                    <div className="worker-info">
                                        <h4>{worker.name}</h4>
                                        <span className="location"><FiMapPin size={12} />{worker.location?.district}</span>
                                    </div>
                                </div>
                                <div className="skills-list">
                                    {worker.skills?.map((s, i) => (
                                        <span key={i} className={`skill-tag ${s.level}`}>{s.skill}</span>
                                    ))}
                                </div>
                                <div className="labor-stats">
                                    <div className="stat">
                                        <span className="value">₹{worker.wages?.daily}</span>
                                        <span className="label">/{t('common.day') || 'day'}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="value">{worker.completedJobs || 0}</span>
                                        <span className="label">{t('labor.jobsDone') || 'jobs done'}</span>
                                    </div>
                                </div>
                                {contactVisible[worker._id] ? (
                                    <div className="contact-info-box">
                                        <div className="contact-phone">
                                            <FiPhone size={16} />
                                            <a href={`tel:${worker.phone}`}>{worker.phone}</a>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        fullWidth
                                        icon={<FiPhone />}
                                        onClick={() => setContactVisible(prev => ({ ...prev, [worker._id]: true }))}
                                    >
                                        {t('common.contact') || 'Contact'}
                                    </Button>
                                )}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="no-laborers-message">
                        <FiUser size={48} />
                        <h3>{t('labor.noWorkers') || 'No workers available'}{cityFilter ? ` in ${cityFilter}` : ''}</h3>
                        <p>
                            {cityFilter
                                ? (t('labor.tryDifferent') || 'Try selecting a different city or register yourself')
                                : (t('labor.beFirst') || 'Be the first to register as a worker!')
                            }
                        </p>
                        <Button onClick={() => setIsModalOpen(true)}>
                            {t('labor.registerAsLabor') || 'Register as Labor'}
                        </Button>
                    </div>
                )}
            </section>

            <LaborRegistrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleRegisterLaborer}
            />
        </div>
    );
};

export default LaborHiring;
