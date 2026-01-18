import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { seedService } from '../services/services';
import { FiMapPin, FiSearch, FiRefreshCw, FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import { GiWheat, GiCorn } from 'react-icons/gi';
import toast from 'react-hot-toast';
import './SeedAvailability.css';

const SeedAvailability = () => {
    const { t, language } = useLanguage();
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [seedData, setSeedData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingSeeds, setLoadingSeeds] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchDistricts();
    }, []);

    const fetchDistricts = async () => {
        setLoading(true);
        try {
            const response = await seedService.getDistricts();
            if (response.success) {
                setDistricts(response.data);
            }
        } catch (error) {
            console.error('Error fetching districts:', error);
            toast.error(t('seeds.fetchError') || 'Failed to load districts');
        } finally {
            setLoading(false);
        }
    };

    const handleDistrictClick = async (district) => {
        setSelectedDistrict(district);
        setLoadingSeeds(true);
        try {
            const response = await seedService.getSeedsByDistrict(district.districtId);
            if (response.success) {
                setSeedData(response.data);
            }
        } catch (error) {
            console.error('Error fetching seeds:', error);
            toast.error(t('seeds.fetchSeedsError') || 'Failed to load seed data');
        } finally {
            setLoadingSeeds(false);
        }
    };

    const handleBack = () => {
        setSelectedDistrict(null);
        setSeedData([]);
    };

    const getDistrictName = (district) => {
        if (language === 'ta' && district.nameTamil) {
            return district.nameTamil;
        }
        return district.name;
    };

    const filteredDistricts = districts.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        (d.nameTamil && d.nameTamil.includes(search))
    );

    // Seed variety headers
    const seedVarieties = [
        { key: 'paddy', name: 'Paddy', nameTamil: 'நெல்' },
        { key: 'cholam', name: 'Cholam', nameTamil: 'சோளம்' },
        { key: 'maize', name: 'Maize', nameTamil: 'மக்காச்சோளம்' },
        { key: 'cumbu', name: 'Cumbu', nameTamil: 'கம்பு' },
        { key: 'ragi', name: 'Ragi', nameTamil: 'ராகி' },
        { key: 'groundnut', name: 'Groundnut', nameTamil: 'நிலக்கடலை' },
        { key: 'blackgram', name: 'Blackgram', nameTamil: 'உளுந்து' },
        { key: 'greengram', name: 'Greengram', nameTamil: 'பாசிப்பயறு' },
        { key: 'cotton', name: 'Cotton', nameTamil: 'பருத்தி' },
    ];

    return (
        <div className="seed-availability-page">
            {!selectedDistrict ? (
                <>
                    {/* Header */}
                    <div className="page-header">
                        <div className="header-content">
                            <h1 className="page-title">
                                <GiWheat className="title-icon" />
                                {t('seeds.title') || 'Seed Availability'}
                            </h1>
                            <p className="page-subtitle">
                                {t('seeds.subtitle') || 'District-wise seed stock position from Tamil Nadu Agriculture Department'}
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="search-section">
                        <div className="search-box">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder={t('seeds.searchDistrict') || 'Search district...'}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Districts Grid */}
                    {loading ? (
                        <div className="loading-state">
                            <FiRefreshCw className="spin" />
                            <span>{t('common.loading') || 'Loading...'}</span>
                        </div>
                    ) : (
                        <div className="districts-grid">
                            {filteredDistricts.map((district) => (
                                <div
                                    key={district.districtId}
                                    className="district-card"
                                    onClick={() => handleDistrictClick(district)}
                                >
                                    <div className="district-icon">
                                        <FiMapPin />
                                    </div>
                                    <div className="district-info">
                                        <h3>{getDistrictName(district)}</h3>
                                        <span className="english-name">
                                            {language === 'ta' ? district.name : ''}
                                        </span>
                                    </div>
                                    <FiExternalLink className="arrow-icon" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Source Info */}
                    <div className="source-info">
                        <span className="source-badge">
                            🏛️ {t('seeds.source') || 'Source: TN Agriculture Department (tnagrisnet.tn.gov.in)'}
                        </span>
                    </div>
                </>
            ) : (
                <>
                    {/* District Detail View */}
                    <div className="page-header with-back">
                        <button className="back-btn" onClick={handleBack}>
                            <FiArrowLeft />
                            {t('common.back') || 'Back'}
                        </button>
                        <div className="header-content">
                            <h1 className="page-title">
                                <GiCorn className="title-icon" />
                                {getDistrictName(selectedDistrict)} - {t('seeds.seedAvailability') || 'Seed Availability'}
                            </h1>
                            <p className="page-subtitle">
                                {t('seeds.aecList') || 'Agriculture Extension Centres (AECs)'}
                            </p>
                        </div>
                    </div>

                    {loadingSeeds ? (
                        <div className="loading-state">
                            <FiRefreshCw className="spin" />
                            <span>{t('seeds.loadingSeeds') || 'Loading seed data...'}</span>
                        </div>
                    ) : seedData.length === 0 ? (
                        <div className="empty-state">
                            <GiWheat className="empty-icon" />
                            <h3>{t('seeds.noData') || 'No seed data available'}</h3>
                            <p>{t('seeds.tryAgain') || 'Please try again later or select another district'}</p>
                        </div>
                    ) : (
                        <div className="seed-table-container">
                            <table className="seed-table">
                                <thead>
                                    <tr>
                                        <th className="aec-header">
                                            {t('seeds.aecName') || 'AEC / Place'}
                                        </th>
                                        {seedVarieties.map(variety => (
                                            <th key={variety.key}>
                                                {language === 'ta' ? variety.nameTamil : variety.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {seedData.map((aec, index) => (
                                        <tr key={index}>
                                            <td className="aec-name">{aec.aecName}</td>
                                            {seedVarieties.map(variety => (
                                                <td key={variety.key} className={aec.seeds?.[variety.key] > 0 ? 'has-stock' : 'no-stock'}>
                                                    {aec.seeds?.[variety.key] || 0}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SeedAvailability;
