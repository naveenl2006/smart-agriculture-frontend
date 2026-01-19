import { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { farmSetupService } from '../services/services';
import {
    FiCheck, FiDownload, FiAlertTriangle, FiDroplet,
    FiTrendingUp, FiSun, FiRefreshCw, FiInfo
} from 'react-icons/fi';
import { GiChicken, GiGoat, GiCow, GiFishingHook, GiWheat } from 'react-icons/gi';
import toast from 'react-hot-toast';
import './FarmSetup.css';
import Farm3DVisualization from '../components/farm-setup/Farm3DVisualization';

const FarmSetup = () => {
    const { t } = useLanguage();
    const [landSize, setLandSize] = useState(50);
    const [farmingTypes, setFarmingTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const resultRef = useRef(null);

    const farmingOptions = [
        { id: 'hen', label: t('farmSetup.henFarming') || 'Hen Farming', icon: GiChicken, emoji: '🐔' },
        { id: 'goat', label: t('farmSetup.goatFarming') || 'Goat Farming', icon: GiGoat, emoji: '🐐' },
        { id: 'cow', label: t('farmSetup.cowFarming') || 'Cow Farming', icon: GiCow, emoji: '🐄' },
        { id: 'fish', label: t('farmSetup.fishFarming') || 'Fish Farming', icon: GiFishingHook, emoji: '🐟' },
    ];

    const toggleFarmingType = (typeId) => {
        setFarmingTypes(prev =>
            prev.includes(typeId)
                ? prev.filter(t => t !== typeId)
                : [...prev, typeId]
        );
    };

    const selectAll = () => {
        setFarmingTypes(['hen', 'goat', 'cow', 'fish']);
    };

    const handleCalculate = async () => {
        if (farmingTypes.length === 0) {
            toast.error(t('farmSetup.selectAtLeastOne') || 'Please select at least one farming type');
            return;
        }

        setLoading(true);
        try {
            const response = await farmSetupService.calculate({ landSize, farmingTypes });
            setResult(response.data);

            // Scroll to results
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

            toast.success(t('farmSetup.calculationComplete') || 'Farm setup calculated!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Calculation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            // Dynamic import for PDF generation
            const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
                import('jspdf'),
                import('html2canvas')
            ]);

            const element = resultRef.current;
            if (!element) return;

            toast.loading('Generating PDF...', { id: 'pdf' });

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`farm-setup-${landSize}-cents.pdf`);

            toast.success('PDF downloaded!', { id: 'pdf' });
        } catch (error) {
            console.error('PDF generation failed:', error);
            toast.error('Failed to generate PDF', { id: 'pdf' });
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getSuitabilityColor = (level) => {
        switch (level) {
            case 'high': return 'var(--color-success)';
            case 'medium': return 'var(--color-warning)';
            case 'low': return 'var(--color-error)';
            default: return 'var(--color-text-secondary)';
        }
    };

    return (
        <div className="farm-setup-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <GiWheat className="title-icon" />
                        {t('farmSetup.title') || 'Farm Setup Planner'}
                    </h1>
                    <p className="page-subtitle">
                        {t('farmSetup.subtitle') || 'Plan your optimal farm layout based on available land'}
                    </p>
                </div>
            </div>

            {/* Input Section */}
            <div className="setup-form-section">
                <Card className="input-card">
                    <h3 className="section-title">
                        <FiInfo className="section-icon" />
                        {t('farmSetup.enterDetails') || 'Enter Your Farm Details'}
                    </h3>

                    {/* Land Size Input */}
                    <div className="form-group">
                        <label className="form-label">
                            {t('farmSetup.availableLand') || 'Available Free Land'}
                        </label>
                        <div className="land-input-wrapper">
                            <input
                                type="range"
                                min="11"
                                max="99"
                                value={landSize}
                                onChange={(e) => setLandSize(Number(e.target.value))}
                                className="land-slider"
                            />
                            <div className="land-value-display">
                                <input
                                    type="number"
                                    min="11"
                                    max="99"
                                    value={landSize}
                                    onChange={(e) => {
                                        const val = Math.min(99, Math.max(11, Number(e.target.value)));
                                        setLandSize(val);
                                    }}
                                    className="land-number-input"
                                />
                                <span className="land-unit">{t('farmSetup.cents') || 'cents'}</span>
                            </div>
                        </div>
                        <div className="land-range-labels">
                            <span>{'>'} 10 {t('farmSetup.cents') || 'cents'}</span>
                            <span>{t('farmSetup.approx') || 'Approx.'} {Math.round(landSize * 435.6).toLocaleString()} sq ft</span>
                            <span>{'<'} 100 {t('farmSetup.cents') || 'cents'}</span>
                        </div>
                    </div>

                    {/* Farming Interest Selection */}
                    <div className="form-group">
                        <div className="form-label-row">
                            <label className="form-label">
                                {t('farmSetup.selectInterests') || 'Select Farming Interests'}
                            </label>
                            <button
                                type="button"
                                className="select-all-btn"
                                onClick={selectAll}
                            >
                                {t('farmSetup.selectAll') || 'Select All'}
                            </button>
                        </div>
                        <div className="farming-options-grid">
                            {farmingOptions.map(option => (
                                <button
                                    key={option.id}
                                    type="button"
                                    className={`farming-option ${farmingTypes.includes(option.id) ? 'selected' : ''}`}
                                    onClick={() => toggleFarmingType(option.id)}
                                >
                                    <span className="option-emoji">{option.emoji}</span>
                                    <span className="option-label">{option.label}</span>
                                    {farmingTypes.includes(option.id) && (
                                        <FiCheck className="check-icon" />
                                    )}
                                </button>
                            ))}
                        </div>
                        {farmingTypes.includes('fish') && landSize < 15 && (
                            <div className="warning-message">
                                <FiAlertTriangle />
                                <span>{t('farmSetup.fishWarning') || 'Fish farming requires minimum 15 cents of land'}</span>
                            </div>
                        )}
                    </div>

                    <Button
                        className="calculate-btn"
                        onClick={handleCalculate}
                        disabled={loading || farmingTypes.length === 0}
                    >
                        {loading ? (
                            <>
                                <FiRefreshCw className="spin" />
                                {t('common.loading') || 'Calculating...'}
                            </>
                        ) : (
                            <>
                                <FiTrendingUp />
                                {t('farmSetup.calculateSetup') || 'Calculate Optimal Setup'}
                            </>
                        )}
                    </Button>
                </Card>
            </div>

            {/* Results Section */}
            {result && (
                <div className="results-section" ref={resultRef}>
                    <div className="results-header">
                        <h2>{t('farmSetup.yourFarmPlan') || 'Your Optimized Farm Plan'}</h2>
                        <Button
                            variant="outline"
                            onClick={handleDownloadPDF}
                            icon={<FiDownload />}
                        >
                            {t('farmSetup.downloadPDF') || 'Download PDF'}
                        </Button>
                    </div>

                    {/* Warnings */}
                    {result.warnings?.length > 0 && (
                        <div className="warnings-section">
                            {result.warnings.map((warning, i) => (
                                <div key={i} className="warning-banner">
                                    <FiAlertTriangle />
                                    <span>{warning}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Area Breakdown */}
                    {result.areaBreakdown && (
                        <div className="area-breakdown-section">
                            <div className="area-breakdown-items">
                                <div className="area-item">
                                    <span className="area-label">Total Area</span>
                                    <span className="area-value">{result.areaBreakdown.totalArea.toLocaleString()} sq ft</span>
                                </div>
                                <div className="area-item utility">
                                    <span className="area-label">Utility (25%)</span>
                                    <span className="area-value">-{result.areaBreakdown.utilityArea.toLocaleString()} sq ft</span>
                                </div>
                                <div className="area-item usable">
                                    <span className="area-label">Usable Area</span>
                                    <span className="area-value">{result.areaBreakdown.usableArea.toLocaleString()} sq ft</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Capacity Summary */}
                    <div className="capacity-grid">
                        {result.calculatedCapacity.hen && result.calculatedCapacity.hen.count > 0 && (
                            <Card className="capacity-card hen">
                                <div className="capacity-header">
                                    <span className="capacity-emoji">🐔</span>
                                    <h4>{t('farmSetup.henFarming') || 'Hen Farming'}</h4>
                                </div>
                                <div className="capacity-value">
                                    <span className="big-number">{result.calculatedCapacity.hen.count.toLocaleString()}</span>
                                    <span className="unit">{t('farmSetup.hens') || 'Hens'}</span>
                                </div>
                                <div className="capacity-details">
                                    <div><span>Shed Area:</span> {result.calculatedCapacity.hen.shedArea.toLocaleString()} sq ft</div>
                                    <div><span>Feed Area:</span> {result.calculatedCapacity.hen.feedArea.toLocaleString()} sq ft</div>
                                    <div><span>Egg Collection:</span> {result.calculatedCapacity.hen.eggCollectionArea.toLocaleString()} sq ft</div>
                                </div>
                            </Card>
                        )}

                        {result.calculatedCapacity.goat && result.calculatedCapacity.goat.count > 0 && (
                            <Card className="capacity-card goat">
                                <div className="capacity-header">
                                    <span className="capacity-emoji">🐐</span>
                                    <h4>{t('farmSetup.goatFarming') || 'Goat Farming'}</h4>
                                </div>
                                <div className="capacity-value">
                                    <span className="big-number">{result.calculatedCapacity.goat.count.toLocaleString()}</span>
                                    <span className="unit">{t('farmSetup.goats') || 'Goats'}</span>
                                </div>
                                <div className="capacity-details">
                                    <div><span>Shed Area:</span> {result.calculatedCapacity.goat.shedArea.toLocaleString()} sq ft</div>
                                    <div><span>Grazing Area:</span> {result.calculatedCapacity.goat.grazingArea.toLocaleString()} sq ft</div>
                                    <div><span>Water & Feed:</span> {result.calculatedCapacity.goat.waterFeedArea.toLocaleString()} sq ft</div>
                                </div>
                            </Card>
                        )}

                        {result.calculatedCapacity.cow && result.calculatedCapacity.cow.count > 0 && (
                            <Card className="capacity-card cow">
                                <div className="capacity-header">
                                    <span className="capacity-emoji">🐄</span>
                                    <h4>{t('farmSetup.cowFarming') || 'Cow Farming'}</h4>
                                </div>
                                <div className="capacity-value">
                                    <span className="big-number">{result.calculatedCapacity.cow.count.toLocaleString()}</span>
                                    <span className="unit">{t('farmSetup.cows') || 'Cows'}</span>
                                </div>
                                <div className="capacity-details">
                                    <div><span>Cattle Shed:</span> {result.calculatedCapacity.cow.shedArea.toLocaleString()} sq ft</div>
                                    <div><span>Milking Area:</span> {result.calculatedCapacity.cow.milkingArea.toLocaleString()} sq ft</div>
                                    <div><span>Fodder Storage:</span> {result.calculatedCapacity.cow.fodderStorage.toLocaleString()} sq ft</div>
                                </div>
                            </Card>
                        )}

                        {result.calculatedCapacity.fish && result.calculatedCapacity.fish.estimatedFishCount > 0 && (
                            <Card className="capacity-card fish">
                                <div className="capacity-header">
                                    <span className="capacity-emoji">🐟</span>
                                    <h4>{t('farmSetup.fishFarming') || 'Fish Farming'}</h4>
                                </div>
                                <div className="capacity-value">
                                    <span className="big-number">{result.calculatedCapacity.fish.estimatedFishCount.toLocaleString()}</span>
                                    <span className="unit">{t('farmSetup.fish') || 'Fish'}</span>
                                </div>
                                <div className="capacity-details">
                                    <div><span>Pond Area:</span> {result.calculatedCapacity.fish.pondArea.toLocaleString()} sq ft</div>
                                    <div><span>Pond Depth:</span> {result.calculatedCapacity.fish.pondDepth} ft</div>
                                    <div><span>Fish Types:</span> {result.calculatedCapacity.fish.fishTypes.join(', ')}</div>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Profit Estimate */}
                    <Card className="profit-card">
                        <h3 className="section-title">
                            <FiTrendingUp className="section-icon profit" />
                            {t('farmSetup.profitEstimate') || 'Profit Estimate'}
                        </h3>
                        <div className="profit-grid">
                            <div className="profit-item monthly">
                                <span className="profit-label">{t('farmSetup.monthlyProfit') || 'Monthly Profit'}</span>
                                <span className="profit-value">{formatCurrency(result.profitEstimate.monthly.total)}</span>
                            </div>
                            <div className="profit-item annual">
                                <span className="profit-label">{t('farmSetup.annualProfit') || 'Annual Profit'}</span>
                                <span className="profit-value">{formatCurrency(result.profitEstimate.annual.total)}</span>
                            </div>
                        </div>
                        <div className="profit-breakdown">
                            {result.profitEstimate.monthly.hen > 0 && (
                                <div className="breakdown-item">
                                    <span>🐔 Hen:</span>
                                    <span>{formatCurrency(result.profitEstimate.monthly.hen)}/month</span>
                                </div>
                            )}
                            {result.profitEstimate.monthly.goat > 0 && (
                                <div className="breakdown-item">
                                    <span>🐐 Goat:</span>
                                    <span>{formatCurrency(result.profitEstimate.monthly.goat)}/month</span>
                                </div>
                            )}
                            {result.profitEstimate.monthly.cow > 0 && (
                                <div className="breakdown-item">
                                    <span>🐄 Cow:</span>
                                    <span>{formatCurrency(result.profitEstimate.monthly.cow)}/month</span>
                                </div>
                            )}
                            {result.profitEstimate.monthly.fish > 0 && (
                                <div className="breakdown-item">
                                    <span>🐟 Fish:</span>
                                    <span>{formatCurrency(result.profitEstimate.monthly.fish)}/month</span>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Summary Cards */}
                    <div className="summary-grid">
                        {/* Water Requirement */}
                        <Card className="summary-card water">
                            <div className="summary-icon">
                                <FiDroplet />
                            </div>
                            <div className="summary-content">
                                <h4>{t('farmSetup.waterRequirement') || 'Water Requirement'}</h4>
                                <span className={`summary-badge ${result.waterRequirement.level}`}>
                                    {result.waterRequirement.level.toUpperCase()}
                                </span>
                                <span className="summary-detail">
                                    ~{result.waterRequirement.dailyLiters.toLocaleString()} L/day
                                </span>
                            </div>
                        </Card>

                        {/* Maintenance Level */}
                        <Card className="summary-card maintenance">
                            <div className="summary-icon">
                                <FiRefreshCw />
                            </div>
                            <div className="summary-content">
                                <h4>{t('farmSetup.maintenanceLevel') || 'Maintenance Level'}</h4>
                                <span className={`summary-badge ${result.maintenanceLevel}`}>
                                    {result.maintenanceLevel.toUpperCase()}
                                </span>
                            </div>
                        </Card>

                        {/* Current Season */}
                        <Card className="summary-card season">
                            <div className="summary-icon">
                                <FiSun />
                            </div>
                            <div className="summary-content">
                                <h4>{t('farmSetup.currentSeason') || 'Current Season'}</h4>
                                <span className="summary-badge info">
                                    {result.currentSeason.toUpperCase()}
                                </span>
                            </div>
                        </Card>
                    </div>

                    {/* Seasonal Suitability */}
                    <Card className="seasonal-card">
                        <h3 className="section-title">
                            <FiSun className="section-icon" />
                            {t('farmSetup.seasonalSuitability') || 'Seasonal Suitability'}
                        </h3>
                        <div className="seasonal-grid">
                            {result.seasonalRecommendations.map((rec, i) => (
                                <div key={i} className="seasonal-item">
                                    <div className="seasonal-header">
                                        <span className="farming-type">
                                            {rec.farmingType === 'hen' && '🐔'}
                                            {rec.farmingType === 'goat' && '🐐'}
                                            {rec.farmingType === 'cow' && '🐄'}
                                            {rec.farmingType === 'fish' && '🐟'}
                                            {' '}{rec.farmingType.charAt(0).toUpperCase() + rec.farmingType.slice(1)}
                                        </span>
                                        <span
                                            className="suitability-badge"
                                            style={{ backgroundColor: getSuitabilityColor(rec.suitability) }}
                                        >
                                            {rec.suitability.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="seasonal-notes">{rec.notes}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Waste Reuse Flow */}
                    {result.wasteReuseFlow.hasBiogas && (
                        <Card className="waste-card">
                            <h3 className="section-title">
                                ♻️ {t('farmSetup.wasteReuse') || 'Waste Reuse & Sustainability'}
                            </h3>
                            <div className="waste-flow">
                                <div className="waste-flow-diagram">
                                    {result.wasteReuseFlow.hasBiogas && (
                                        <>
                                            <div className="flow-step">
                                                <span className="flow-icon">🐄</span>
                                                <span>Cow Dung</span>
                                            </div>
                                            <span className="flow-arrow">→</span>
                                            <div className="flow-step">
                                                <span className="flow-icon">⚡</span>
                                                <span>Biogas ({result.wasteReuseFlow.biogasCapacity} m³)</span>
                                            </div>
                                            <span className="flow-arrow">→</span>
                                            <div className="flow-step">
                                                <span className="flow-icon">🍳</span>
                                                <span>Cooking Fuel</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {result.wasteReuseFlow.slurryForFishPond && (
                                    <div className="waste-flow-diagram secondary">
                                        <div className="flow-step">
                                            <span className="flow-icon">🧪</span>
                                            <span>Biogas Slurry</span>
                                        </div>
                                        <span className="flow-arrow">→</span>
                                        <div className="flow-step">
                                            <span className="flow-icon">🐟</span>
                                            <span>Fish Pond (Nutrients)</span>
                                        </div>
                                        <span className="flow-arrow">→</span>
                                        <div className="flow-step highlight">
                                            <span className="flow-icon">💰</span>
                                            <span>20-30% Feed Cost Savings</span>
                                        </div>
                                    </div>
                                )}
                                <p className="waste-notes">{result.wasteReuseFlow.notes}</p>
                            </div>
                        </Card>
                    )}

                    {/* 3D Farm Layout Visualization */}
                    <Card className="visualization-card">
                        <h3 className="section-title">
                            🎨 {t('farmSetup.farmVisualization') || 'Farm Layout Visualization'}
                        </h3>
                        <Farm3DVisualization result={result} />
                        <details className="prompt-details">
                            <summary>{t('farmSetup.viewPrompt') || 'View AI Prompt (for manual generation)'}</summary>
                            <pre className="ai-prompt">{result.visualizationPrompt}</pre>
                        </details>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default FarmSetup;