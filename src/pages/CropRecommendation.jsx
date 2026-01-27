import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FiDroplet, FiSun, FiLayers, FiCalendar, FiMapPin, FiActivity } from 'react-icons/fi';
import { GiPlantRoots, GiSatelliteCommunication } from 'react-icons/gi';
import { cropService } from '../services/services';
import './CropRecommendation.css';

// Crop images mapping
const CROP_IMAGES = {
    'Rice': 'https://t3.ftcdn.net/jpg/02/71/72/42/240_F_271724261_Uv72ndt8gDukKxpXQwv2kYgXQ6HiYyJs.jpg',
    'Wheat': 'https://t3.ftcdn.net/jpg/02/70/35/96/240_F_270359648_zAqMDxwIttvynEGdwQ1usRLE5Jwk7OBx.jpg',
    'Maize': 'https://t4.ftcdn.net/jpg/18/58/56/99/240_F_1858569936_yqeRNiq7YyqIPZ67fEEybbrM9V7dj0XT.jpg',
    'Cotton': 'https://t4.ftcdn.net/jpg/06/84/31/79/240_F_684317966_Pn9qU1DEfW5zpwoj25znJ1i0VdaOM2Px.jpg',
    'Sugarcane': 'https://t4.ftcdn.net/jpg/11/30/99/23/240_F_1130992370_ylOpnwPmQX3fFxQmdsliN0nb9FAkKGD8.jpg',
    'Groundnut': 'https://t3.ftcdn.net/jpg/14/07/05/82/240_F_1407058218_diQXMlpC2sQPzIy1DAKlMjMd7zdysrUM.jpg',
    'Soybean': 'https://t4.ftcdn.net/jpg/15/48/02/37/240_F_1548023770_1zPMaaksjQBzyiiO0iWYDj3sKNfZS2Oo.jpg',
    'Tomato': 'https://t3.ftcdn.net/jpg/11/78/49/28/240_F_1178492894_OrDfVv7PA7ksge8DnfDPtQheuhWl2jFu.jpg',
    'Potato': 'https://t4.ftcdn.net/jpg/16/86/72/93/240_F_1686729323_AV7Kao010lMbhcuOwyhBecF8qkSR9Lco.jpg',
    'Chickpea': 'https://t3.ftcdn.net/jpg/18/47/15/32/240_F_1847153276_hqzIZXg4baVGYnSeFra0NNgnCdFtED9x.jpg',
    'Mustard': 'https://t4.ftcdn.net/jpg/16/32/09/51/240_F_1632095188_iiiZPMv93pKdERDBVBfHVD8tKbIpJcfv.jpg',
    'Barley': 'https://t3.ftcdn.net/jpg/15/77/58/98/240_F_1577589837_CTRhW5n0PgnmbtOSpn21aUZmX8o3FLkc.jpg',
    'Watermelon': 'https://t3.ftcdn.net/jpg/09/30/48/78/240_F_930487874_i1FthzPZHAVTTuMR3vG08hfhp42cEkd4.jpg',
    'Muskmelon': 'https://t3.ftcdn.net/jpg/18/27/41/04/240_F_1827410411_PgwN5eFEzRdYImCuxDqHyWiFrmV708AT.jpg',
    'Bajra': 'https://t3.ftcdn.net/jpg/16/43/85/80/240_F_1643858067_kKZin4NYR3sZtwXkWCToKGWXm2YGGbnj.jpg',
    'Jowar': 'https://t4.ftcdn.net/jpg/18/42/64/61/240_F_1842646109_pEgRwFJBY0XBctxUU4urKHy2opm1r5XP.jpg',
    'Peas': 'https://t4.ftcdn.net/jpg/17/50/08/47/240_F_1750084794_YzPD70Gj31i9QG1L0FOwXDkMzHIwVkRv.jpg',
    'Gram': 'https://t3.ftcdn.net/jpg/14/26/04/34/240_F_1426043447_sdiHRHTOGvGjIUSAQNUq1OEMYOWgTibM.jpg',
    'Lentil': 'https://t3.ftcdn.net/jpg/06/24/16/18/240_F_624161869_qY86D3oI9WF0LGZcBnnoS4WAK9dlzw4k.jpg',
    'Cucumber': 'https://t3.ftcdn.net/jpg/17/35/11/10/240_F_1735111002_UbSSgUVVnzNUzv5JowYD2oedNuztJanB.jpg',
    'Okra': 'https://t4.ftcdn.net/jpg/02/24/12/53/240_F_224125313_LKVU7K0tdAnPmad0WTzisdCTtlLhQFwb.jpg',
    'Sesame': 'https://t3.ftcdn.net/jpg/03/18/29/74/240_F_318297450_UBhmi9QVsYWEZFBQJ1D4hESMZonsKD4f.jpg',
    'Cumin': 'https://t4.ftcdn.net/jpg/18/44/47/75/240_F_1844477578_jVQbcHQfzSPEO80aqyLHj7sQNFvCsBL5.jpg',
    'Cluster Beans': 'https://t3.ftcdn.net/jpg/18/48/73/40/240_F_1848734048_Y0rMbsqsWZ1KNymlH8hp7hPvXndGMcbd.jpg',
    'Sunflower': 'https://t4.ftcdn.net/jpg/18/43/37/45/240_F_1843374595_HJv0v04Y1kOlkesLUqX4aQd36t47KWbE.jpg',
    'Sorghum': 'https://t3.ftcdn.net/jpg/16/63/69/16/240_F_1663691625_GSMXd94flnZAi4PjEEbgLLnHkQr7Z1T7.jpg',
    'Pulses': 'https://t4.ftcdn.net/jpg/16/68/81/13/240_F_1668811379_u8xQF3SRYlLpFsPKuSN0CI4bJih5Cppt.jpg',
    'Millets': 'https://t3.ftcdn.net/jpg/16/36/01/78/240_F_1636017899_YLQEJKLBCiPpa2HePt6oFQx1KsDp2DCl.jpg',
    'Vegetables': 'https://t4.ftcdn.net/jpg/06/34/02/67/240_F_634026715_LNnib52S2nlXssO7Sz4Vbotq9davts9S.jpg',
    'Chilli': 'https://t3.ftcdn.net/jpg/17/34/41/42/240_F_1734414285_PJe0vgT3w5CKeQ5OTIMqdOVHxw1c5oS8.jpg',
    'Fodder crops': 'https://t3.ftcdn.net/jpg/18/55/57/42/240_F_1855574292_bhPHQuj2LIB0Rm1GIMNghnM4ofUEhyro.jpg',
};

// Crop recommendation database based on soil, season, and water
const CROP_RECOMMENDATIONS = {
    clay: {
        rabi: {
            low: ['Barley', 'Chickpea'],
            medium: ['Wheat', 'Mustard'],
            high: ['Wheat', 'Potato']
        },
        summer: {
            low: ['Gram', 'Lentil'],
            medium: ['Watermelon', 'Muskmelon'],
            high: ['Rice', 'Vegetables']
        },
        kharif: {
            low: ['Bajra', 'Jowar'],
            medium: ['Maize', 'Cotton'],
            high: ['Rice', 'Sugarcane']
        }
    },
    loam: {
        kharif: {
            low: ['Bajra', 'Jowar'],
            medium: ['Maize', 'Soybean', 'Groundnut'],
            high: ['Rice', 'Sugarcane', 'Cotton']
        },
        rabi: {
            low: ['Gram', 'Lentil'],
            medium: ['Wheat', 'Mustard', 'Peas'],
            high: ['Wheat', 'Potato', 'Vegetables']
        },
        summer: {
            low: ['Gram', 'Lentil'],
            medium: ['Cucumber', 'Tomato', 'Okra'],
            high: ['Watermelon', 'Muskmelon']
        }
    },
    sandy: {
        kharif: {
            low: ['Jowar', 'Sesame'],
            medium: ['Bajra', 'Groundnut'],
            high: ['Maize', 'Cotton']
        },
        rabi: {
            low: ['Gram', 'Cumin'],
            medium: ['Mustard', 'Barley'],
            high: ['Wheat', 'Potato']
        },
        summer: {
            low: ['Cluster Beans'],
            medium: ['Watermelon', 'Muskmelon'],
            high: ['Cucumber', 'Tomato']
        }
    },
    black: {
        kharif: {
            low: ['Jowar', 'Bajra'],
            medium: ['Cotton', 'Soybean'],
            high: ['Sugarcane']
        },
        rabi: {
            low: ['Chickpea'],
            medium: ['Wheat', 'Sunflower'],
            high: ['Wheat', 'Potato']
        },
        summer: {
            low: ['Gram', 'Lentil'],
            medium: ['Sorghum'],
            high: ['Vegetables']
        }
    },
    red: {
        kharif: {
            low: ['Pulses', 'Jowar'],
            medium: ['Groundnut', 'Millets'],
            high: ['Rice', 'Sugarcane']
        },
        rabi: {
            low: ['Mustard'],
            medium: ['Wheat', 'Gram'],
            high: ['Wheat', 'Vegetables']
        },
        summer: {
            low: ['Gram', 'Lentil'],
            medium: ['Vegetables', 'Chilli', 'Tomato'],
            high: ['Watermelon', 'Muskmelon']
        }
    },
    alluvial: {
        kharif: {
            low: ['Bajra', 'Jowar'],
            medium: ['Maize', 'Cotton'],
            high: ['Rice', 'Sugarcane']
        },
        rabi: {
            low: ['Mustard', 'Gram'],
            medium: ['Wheat', 'Potato'],
            high: ['Wheat', 'Vegetables', 'Potato']
        },
        summer: {
            low: ['Gram', 'Lentil'],
            medium: ['Vegetables', 'Fodder crops'],
            high: ['Vegetables', 'Sugarcane']
        }
    }
};

// Soil type descriptions
const SOIL_DESCRIPTIONS = {
    clay: 'High water retention - good for water-loving crops',
    loam: 'Best balanced soil - ideal for most crops',
    sandy: 'Low water retention - good for root vegetables',
    black: 'Cotton soil - excellent moisture holding',
    red: 'Low nitrogen, good drainage - needs fertilizers',
    alluvial: 'Very fertile - ideal for river basins'
};

const CropRecommendation = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        landSize: '',
        landUnit: 'acres',
        soilType: '',
        waterAvailability: '',
        season: '',
    });

    // NDVI state
    const [ndviDistrict, setNdviDistrict] = useState('');
    const [ndviLoading, setNdviLoading] = useState(false);
    const [ndviData, setNdviData] = useState(null);
    const [ndviError, setNdviError] = useState('');
    const [districts] = useState([
        'Coimbatore', 'Chennai', 'Madurai', 'Salem', 'Tiruchirappalli',
        'Thanjavur', 'Erode', 'Tirunelveli', 'Vellore', 'Tiruppur',
        'Dindigul', 'Cuddalore', 'Kanchipuram', 'Tiruvallur', 'Villupuram',
        'Nagapattinam', 'Nilgiris', 'Kanniyakumari', 'Thoothukudi',
        'Ramanathapuram', 'Sivaganga', 'Virudhunagar', 'Pudukkottai',
        'Karur', 'Namakkal', 'Theni', 'Krishnagiri', 'Dharmapuri'
    ]);

    // Fetch NDVI recommendations
    const fetchNdviRecommendations = async () => {
        if (!ndviDistrict) {
            setNdviError('Please select a district');
            return;
        }

        setNdviLoading(true);
        setNdviError('');

        try {
            const response = await cropService.getNdviRecommendations(ndviDistrict);
            if (response.success) {
                setNdviData(response.data);
            } else {
                setNdviError('Failed to fetch NDVI data');
            }
        } catch (error) {
            setNdviError(error.response?.data?.message || 'Error fetching NDVI data');
        } finally {
            setNdviLoading(false);
        }
    };

    // Calculate suitability score (defined before useMemo)
    const calculateSuitability = (soilType, season, water, index) => {
        const baseScore = 95 - (index * 8);
        const waterBonus = water === 'high' ? 5 : water === 'medium' ? 3 : 0;
        const soilBonus = soilType === 'loam' || soilType === 'alluvial' ? 5 : 0;
        return Math.min(100, Math.max(60, baseScore + waterBonus + soilBonus));
    };

    // Get tips for each crop (defined before useMemo)
    const getCropTips = (crop, soil, water) => {
        const tips = [];
        if (water === 'low') tips.push('Implement drip irrigation for best results');
        if (water === 'high') tips.push('Good water supply - maximize yield potential');
        if (soil === 'clay') tips.push('Add organic matter to improve drainage');
        if (soil === 'sandy') tips.push('Use mulching to retain moisture');
        tips.push(`Best suited for ${soil} soil conditions`);
        return tips;
    };

    // Get recommendations based on current form data
    const recommendations = useMemo(() => {
        const { soilType, season, waterAvailability } = formData;

        if (!soilType || !season || !waterAvailability) {
            return [];
        }

        // Normalize season (combine summer and zaid)
        const normalizedSeason = season === 'zaid' ? 'summer' : season;

        const crops = CROP_RECOMMENDATIONS[soilType]?.[normalizedSeason]?.[waterAvailability] || [];

        return crops.map((cropName, index) => ({
            id: index,
            name: cropName,
            image: CROP_IMAGES[cropName] || CROP_IMAGES['Vegetables'],
            suitability: calculateSuitability(soilType, normalizedSeason, waterAvailability, index),
            tips: getCropTips(cropName, soilType, waterAvailability)
        }));
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Get current season suggestion based on month
    const getCurrentSeasonSuggestion = () => {
        const month = new Date().getMonth();
        if (month >= 5 && month <= 8) return 'kharif';
        if (month >= 9 || month <= 2) return 'rabi';
        return 'summer';
    };

    return (
        <div className="crop-recommendation-page">
            <div className="page-header">
                <h1 className="page-title">🌱 {t('nav.cropRecommendation')}</h1>
                <p className="page-subtitle">{t('crop.subtitle') || 'Get personalized crop suggestions based on your land conditions'}</p>
            </div>

            <div className="recommendation-layout">
                {/* Input Form */}
                <Card title={t('crop.farmDetails') || 'Your Farm Details'} icon={<GiPlantRoots />} className="form-card">
                    <div className="recommendation-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label><FiLayers /> {t('crop.landSize') || 'Land Size'}</label>
                                <div className="input-group">
                                    <input
                                        type="number"
                                        name="landSize"
                                        placeholder="e.g.,5"
                                        value={formData.landSize}
                                        onChange={handleChange}
                                    />
                                    <select name="landUnit" value={formData.landUnit} onChange={handleChange}>
                                        <option value="acres">{t('crop.acres') || 'Acres'}</option>
                                        <option value="hectares">{t('crop.hectares') || 'Hectares'}</option>
                                    </select>
                                </div>
                            </div>
                        </div>



                        <div className="form-group">
                            <label><GiPlantRoots /> {t('crop.soilType') || 'Soil Type'}</label>
                            <select name="soilType" value={formData.soilType} onChange={handleChange}>
                                <option value="">{t('crop.selectSoilType') || 'Select soil type'}</option>
                                <option value="clay">{t('crop.claySoil') || 'Clay Soil'}</option>
                                <option value="loam">{t('crop.loamSoil') || 'Loam Soil'}</option>
                                <option value="sandy">{t('crop.sandySoil') || 'Sandy Soil'}</option>
                                <option value="black">{t('crop.blackSoil') || 'Black Soil'}</option>
                                <option value="red">{t('crop.redSoil') || 'Red Soil'}</option>
                                <option value="alluvial">{t('crop.alluvialSoil') || 'Alluvial Soil'}</option>
                            </select>
                            {formData.soilType && (
                                <span className="field-hint">{SOIL_DESCRIPTIONS[formData.soilType]}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label><FiSun /> {t('crop.season') || 'Season'}</label>
                            <select name="season" value={formData.season} onChange={handleChange}>
                                <option value="">{t('crop.selectSeason') || 'Select season'}</option>
                                <option value="kharif">{t('crop.kharif') || 'Kharif (Jun-Sep) - Monsoon'}</option>
                                <option value="rabi">{t('crop.rabi') || 'Rabi (Oct-Mar) - Winter'}</option>
                                <option value="summer">{t('crop.summer') || 'Summer / Zaid (Mar-Jun)'}</option>
                            </select>
                            <span className="field-hint">
                                💡 Current suggestion: <strong>{getCurrentSeasonSuggestion().toUpperCase()}</strong>
                            </span>
                        </div>

                        <div className="form-group">
                            <label><FiDroplet /> {t('crop.waterAvailability') || 'Water Availability'}</label>
                            <select name="waterAvailability" value={formData.waterAvailability} onChange={handleChange}>
                                <option value="">{t('crop.selectAvailability') || 'Select availability'}</option>
                                <option value="low">{t('crop.waterLow') || 'Low - Rain-fed / Limited irrigation'}</option>
                                <option value="medium">{t('crop.waterMedium') || 'Medium - Canal / Well access'}</option>
                                <option value="high">{t('crop.waterHigh') || 'High - Abundant water supply'}</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Dynamic Results */}
                <div className="results-section">
                    {recommendations.length > 0 ? (
                        <>
                            <div className="results-header">
                                <h3 className="results-title">🌾 {t('crop.recommendedCrops') || 'Recommended Crops'}</h3>
                                <p className="results-subtitle">
                                    Based on <strong>{formData.soilType}</strong> soil, <strong>{formData.season}</strong> season,
                                    and <strong>{formData.waterAvailability}</strong> water availability
                                </p>
                            </div>
                            <div className="recommendations-grid">
                                {recommendations.map((crop, index) => (
                                    <Card key={crop.id} className={`crop-card rank-${index + 1}`} hoverable>
                                        <div className="rank-badge">#{index + 1}</div>
                                        <div className="crop-image-container">
                                            <img
                                                src={crop.image}
                                                alt={crop.name}
                                                className="crop-image"
                                                onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=200&fit=crop';
                                                }}
                                            />
                                        </div>
                                        <div className="crop-info">
                                            <h4 className="crop-name">{crop.name}</h4>
                                            <div className="suitability-bar">
                                                <div
                                                    className="suitability-fill"
                                                    style={{ width: `${crop.suitability}%` }}
                                                ></div>
                                            </div>
                                            <span className="suitability-text">{crop.suitability}% {t('crop.suitable') || 'Suitable'}</span>
                                        </div>
                                        <div className="crop-tips">
                                            {crop.tips.slice(0, 2).map((tip, i) => (
                                                <span key={i} className="tip-tag">💡 {tip}</span>
                                            ))}
                                        </div>
                                        <button
                                            className="plan-crop-btn"
                                            onClick={() => navigate(`/crops/schedule?crop=${encodeURIComponent(crop.name)}`)}
                                        >
                                            <FiCalendar /> {t('crop.planThisCrop') || 'Plan This Crop'}
                                        </button>
                                    </Card>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="empty-results">
                            <div className="empty-icon">🌾</div>
                            <h3>{t('crop.selectConditions') || 'Select Your Farm Conditions'}</h3>
                            <p>{t('crop.selectConditionsDesc') || 'Choose soil type, season, and water availability to see personalized crop recommendations.'}</p>
                            <div className="steps-guide">
                                <div className="step">
                                    <span>Select Soil Type</span>
                                </div>
                                <div className="step">
                                    <span>Choose Season</span>
                                </div>
                                <div className="step">
                                    <span>Set Water Availability</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* NDVI Section */}
            <div className="ndvi-section">
                <div className="ndvi-divider">
                    <span>🛰️ Satellite-Based Analysis</span>
                </div>

                <Card title="NDVI Crop Recommendations" icon={<GiSatelliteCommunication />} className="ndvi-card">
                    <p className="ndvi-description">
                        Get AI-powered crop suggestions based on real-time satellite vegetation data (NDVI) for your district.
                    </p>

                    <div className="ndvi-input-section">
                        <div className="ndvi-select-group">
                            <label><FiMapPin /> Select District (Tamil Nadu)</label>
                            <select
                                value={ndviDistrict}
                                onChange={(e) => setNdviDistrict(e.target.value)}
                                className="ndvi-district-select"
                            >
                                <option value="">-- Select District --</option>
                                {districts.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            className="ndvi-analyze-btn"
                            onClick={fetchNdviRecommendations}
                            disabled={ndviLoading || !ndviDistrict}
                        >
                            {ndviLoading ? '🔄 Analyzing...' : '🛰️ Analyze NDVI'}
                        </button>
                    </div>

                    {ndviError && <div className="ndvi-error">{ndviError}</div>}

                    {ndviData && (
                        <div className="ndvi-results">
                            {/* NDVI Gauge */}
                            <div className="ndvi-gauge-section">
                                <h4>Vegetation Health Index</h4>
                                <div className="ndvi-gauge">
                                    <div className="ndvi-gauge-bg">
                                        <div
                                            className="ndvi-gauge-fill"
                                            style={{
                                                width: `${ndviData.ndvi.percentage}%`,
                                                backgroundColor: ndviData.ndvi.color
                                            }}
                                        />
                                    </div>
                                    <div className="ndvi-gauge-info">
                                        <span className="ndvi-value">{ndviData.ndvi.value}</span>
                                        <span className="ndvi-status" style={{ color: ndviData.ndvi.color }}>
                                            {ndviData.ndvi.categoryEmoji} {ndviData.ndvi.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="ndvi-climate-info">
                                    <span>📍 {ndviData.district}</span>
                                    <span>🌧️ {ndviData.climate.avgRainfall}mm rainfall</span>
                                    <span>🌡️ {ndviData.climate.avgTemp}°C avg</span>
                                    <span>🗓️ {ndviData.climate.currentSeason} season</span>
                                </div>
                            </div>

                            {/* Process Steps */}
                            <div className="ndvi-steps">
                                <h4>Analysis Process</h4>
                                <div className="ndvi-steps-grid">
                                    {ndviData.processSteps.slice(0, 6).map((step) => (
                                        <div key={step.step} className="ndvi-step-item">
                                            <span className="step-num">{step.step}</span>
                                            <span className="step-title">{step.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Advisories */}
                            {ndviData.advisories.map((adv, i) => (
                                <div key={i} className={`ndvi-advisory ndvi-advisory-${adv.type}`}>
                                    <strong>{adv.title}</strong>
                                    <p>{adv.message}</p>
                                </div>
                            ))}

                            {/* NDVI Crop Recommendations */}
                            <div className="ndvi-crops-section">
                                <h4>🌾 Recommended Crops Based on NDVI</h4>
                                <div className="ndvi-crops-grid">
                                    {ndviData.recommendations.map((crop) => (
                                        <div key={crop.id} className="ndvi-crop-card">
                                            <div className="ndvi-crop-header">
                                                <span className="ndvi-crop-name">{crop.name}</span>
                                                <span className={`ndvi-yield-badge yield-${crop.yieldLevel.toLowerCase().replace('-', '')}`}>
                                                    {crop.yieldLevel}
                                                </span>
                                            </div>
                                            <p className="ndvi-crop-advisory">{crop.advisory}</p>
                                            <div className="ndvi-crop-meta">
                                                <span>💧 {crop.waterRequirement} water</span>
                                                <span>📊 {crop.suitabilityScore}% match</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p className="ndvi-disclaimer">
                                ⚠️ {ndviData.metadata.note}
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default CropRecommendation;

