import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { marketService } from '../services/services';
import { FiTrendingUp, FiTrendingDown, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './MarketPrice.css';

const MarketPrice = () => {
    const { t } = useLanguage();
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCommodity, setSelectedCommodity] = useState(null);
    const [priceHistory, setPriceHistory] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchPrices();
    }, []);

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const response = await marketService.getTodayPrices('Kerala');
            console.log('Market API Response:', response.data);
            console.log('First price item:', response.data?.prices[0]);
            setPrices(response.data?.prices || []);
            setLastUpdated(response.data?.lastUpdated);
        } catch (error) {
            console.error('Error fetching prices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const response = await marketService.refreshPrices();
            if (response.success) {
                setPrices(response.data?.prices || []);
                setLastUpdated(response.data?.lastUpdated);
            }
        } catch (error) {
            console.error('Error refreshing prices:', error);
            await fetchPrices();
        } finally {
            setRefreshing(false);
        }
    };

    const fetchHistory = async (commodity) => {
        try {
            const response = await marketService.getPriceHistory(commodity, 30);
            setPriceHistory(response.data?.history || []);
            setSelectedCommodity(commodity);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    // Map English commodity names to translation keys
    const commodityTranslationMap = {
        'Onion big': 'crops.onionBig',
        'Brinjal': 'crops.brinjal',
        'Pumpkin': 'crops.pumpkin',
        'Cucumber': 'crops.cucumber',
        'Ladies Finger': 'crops.ladiesFinger',
        'Cabbage': 'crops.cabbage',
        'Bittergourd': 'crops.bittergourd',
        'Ash gourd': 'crops.ashGourd',
        'Snake gourd': 'crops.snakeGourd',
        'Tomato': 'crops.tomato',
    };

    // Translate commodity name
    const translateCommodity = (commodityName) => {
        const key = commodityTranslationMap[commodityName];
        if (key) {
            return t(key) || commodityName;
        }
        return commodityName;
    };

    const filteredPrices = prices.filter(p =>
        p.commodity?.toLowerCase().includes(search.toLowerCase()) ||
        translateCommodity(p.commodity)?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="market-price-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📈 {t('nav.marketPrices')}</h1>
                    <p className="page-subtitle">{t('market.subtitle') || 'Live vegetable prices from Kerala markets'}</p>
                    {lastUpdated && <p className="last-updated">{t('market.lastUpdated') || 'Last Updated'}: {new Date(lastUpdated).toLocaleString()}</p>}
                </div>
                <Button icon={<FiRefreshCw />} onClick={handleRefresh} loading={refreshing || loading}>
                    {t('market.refresh') || 'Refresh from Ecostat'}
                </Button>
            </div>

            <div className="market-layout">
                <div className="price-table-section">
                    <Card>
                        <div className="table-header">
                            <div className="search-box">
                                <FiSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder={t('market.searchCommodity') || 'Search commodity...'}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="price-table">
                            <div className="table-row header">
                                <span>{t('market.commodity') || 'Commodity'}</span>
                                <span>{t('market.price') || 'Price (₹/kg)'}</span>
                                <span>{t('market.change') || 'Change'}</span>
                                <span>{t('market.trend') || 'Trend'}</span>
                            </div>
                            {filteredPrices.length > 0 ? filteredPrices.map((item, index) => (
                                <div
                                    key={index}
                                    className={`table-row ${selectedCommodity === item.commodity ? 'selected' : ''}`}
                                    onClick={() => fetchHistory(item.commodity)}
                                >
                                    <span className="commodity">{translateCommodity(item.commodity)}</span>
                                    <span className="price">₹{item.price?.modal || item.price}</span>
                                    <span className={`change ${item.priceChange?.trend || 'stable'}`}>
                                        {item.priceChange && item.priceChange.percentage !== null && item.priceChange.percentage !== undefined ? (
                                            <>
                                                {item.priceChange.percentage > 0 ? '+' : ''}
                                                {item.priceChange.percentage.toFixed(2)}%
                                            </>
                                        ) : (
                                            '-'
                                        )}
                                    </span>
                                    <span className="trend">
                                        {item.priceChange?.trend === 'up' ? (
                                            <FiTrendingUp className="trend-up" />
                                        ) : item.priceChange?.trend === 'down' ? (
                                            <FiTrendingDown className="trend-down" />
                                        ) : (
                                            <span className="trend-stable">-</span>
                                        )}
                                    </span>
                                </div>
                            )) : (
                                <div className="no-data">{t('market.noPrices') || 'No prices found'}</div>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="chart-section">
                    {selectedCommodity ? (
                        <Card title={`${translateCommodity(selectedCommodity)} - 30 Day Trend`}>
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={priceHistory}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            formatter={(value) => [`₹${value}`, t('market.price') || 'Price']}
                                            labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN')}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="price.modal"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    ) : (
                        <Card className="chart-placeholder">
                            <div className="placeholder-content">
                                <span className="placeholder-icon">📊</span>
                                <h4>{t('market.selectCommodity') || 'Select a Commodity'}</h4>
                                <p>{t('market.clickToView') || 'Click on any commodity to view its price trend'}</p>
                            </div>
                        </Card>
                    )}

                    <Card title={`📌 ${t('market.dataSource') || 'Data Source'}`}>
                        <div className="tips-list">
                            <div className="tip-item">
                                <span className="tip-icon">🏛️</span>
                                <p>{t('market.ecostataSource') || 'Prices from Kerala Government Ecostat official source'}</p>
                            </div>
                            <div className="tip-item">
                                <span className="tip-icon">📊</span>
                                <p>{t('market.stateAverage') || 'State average prices of vegetables (E50 commodities)'}</p>
                            </div>
                            <div className="tip-item">
                                <span className="tip-icon">🔄</span>
                                <p>{t('market.updateTime') || 'Data updates daily at 10:00 AM'}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MarketPrice;
