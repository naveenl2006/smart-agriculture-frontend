import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { irrigationService, iotService } from '../services/services';
import toast from 'react-hot-toast';
import {
    FiDroplet, FiThermometer, FiCloud, FiPlay, FiPause, FiPlus,
    FiRefreshCw, FiWifi, FiWifiOff, FiSettings, FiTrash2, FiCopy,
    FiCheck, FiX, FiCpu, FiActivity, FiEdit3, FiCalendar, FiClock,
    FiToggleLeft, FiToggleRight
} from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Irrigation.css';

const Irrigation = () => {
    const { t } = useLanguage();
    const [sensors, setSensors] = useState([]);
    const [devices, setDevices] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [sensorHistory, setSensorHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Device registration modal
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    const [newDevice, setNewDevice] = useState({ deviceName: '', deviceType: 'esp32' });
    const [registeredDevice, setRegisteredDevice] = useState(null);
    const [copiedKey, setCopiedKey] = useState(false);

    // Schedule management modal
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [scheduleForm, setScheduleForm] = useState({
        zoneName: '',
        plantType: 'Rice',
        frequency: 'daily',
        startTime: '06:00',
        duration: 30,
        waterLevel: 'medium',
        customWaterAmount: 100,
        scheduleType: 'manual'
    });

    // Plant type options
    const plantTypes = ['Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Maize', 'Vegetables', 'Fruits', 'Pulses', 'Groundnut', 'Other'];

    // Water level presets (liters per m²)
    const waterLevelPresets = {
        low: { label: 'Low', liters: 50, description: 'Light watering for drought-tolerant plants' },
        medium: { label: 'Medium', liters: 100, description: 'Standard watering for most crops' },
        high: { label: 'High', liters: 200, description: 'Heavy watering for water-intensive crops' },
        custom: { label: 'Custom', liters: 0, description: 'Set your own water amount' }
    };

    // Auto refresh interval (30 seconds)
    const REFRESH_INTERVAL = 30000;

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const [iotRes, schedulesRes, analyticsRes, historyRes, devicesRes] = await Promise.all([
                iotService.getRealtimeSensors().catch(() => ({ data: { sensors: [] } })),
                irrigationService.getSchedules().catch(() => ({ data: [] })),
                irrigationService.getWaterUsageAnalytics().catch(() => ({ data: null })),
                irrigationService.getSensorHistory('soil_moisture', 24).catch(() => ({ data: { history: [] } })),
                iotService.getDevices().catch(() => ({ data: [] })),
            ]);

            setSensors(iotRes.data?.sensors || []);
            setDevices(devicesRes.data || []);
            setSchedules(schedulesRes.data || []);
            setAnalytics(analyticsRes.data);
            setSensorHistory(historyRes.data?.history || []);
            setLastUpdated(new Date());
        } catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        // Set up auto-refresh
        const interval = setInterval(() => {
            fetchData(true);
        }, REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, [fetchData]);

    const handleRefresh = () => {
        fetchData(true);
        toast.success('Sensor data refreshed');
    };

    const handleRegisterDevice = async () => {
        if (!newDevice.deviceName.trim()) {
            toast.error('Please enter a device name');
            return;
        }

        try {
            const response = await iotService.registerDevice(newDevice);
            setRegisteredDevice(response.data);
            setDevices(prev => [...prev, response.data]);
            toast.success('Device registered successfully!');
        } catch (error) {
            toast.error('Failed to register device');
        }
    };

    const handleDeleteDevice = async (deviceId) => {
        if (!confirm('Are you sure you want to delete this device?')) return;

        try {
            await iotService.deleteDevice(deviceId);
            setDevices(prev => prev.filter(d => d.deviceId !== deviceId));
            toast.success('Device deleted');
        } catch (error) {
            toast.error('Failed to delete device');
        }
    };

    const copyApiKey = (apiKey) => {
        navigator.clipboard.writeText(apiKey);
        setCopiedKey(true);
        toast.success('API key copied to clipboard');
        setTimeout(() => setCopiedKey(false), 2000);
    };

    const closeModal = () => {
        setShowDeviceModal(false);
        setRegisteredDevice(null);
        setNewDevice({ deviceName: '', deviceType: 'esp32' });
    };

    // Schedule handlers
    const openScheduleModal = (schedule = null) => {
        if (schedule) {
            setEditingSchedule(schedule);
            setScheduleForm({
                zoneName: schedule.zone?.name || '',
                plantType: schedule.plantType || 'Rice',
                frequency: schedule.frequency || 'daily',
                startTime: schedule.time?.start || '06:00',
                duration: schedule.time?.duration || 30,
                waterLevel: schedule.waterLevel || 'medium',
                customWaterAmount: schedule.waterAmount?.value || 100,
                scheduleType: schedule.scheduleType || 'manual'
            });
        } else {
            setEditingSchedule(null);
            setScheduleForm({
                zoneName: '',
                plantType: 'Rice',
                frequency: 'daily',
                startTime: '06:00',
                duration: 30,
                waterLevel: 'medium',
                customWaterAmount: 100,
                scheduleType: 'manual'
            });
        }
        setShowScheduleModal(true);
    };

    const closeScheduleModal = () => {
        setShowScheduleModal(false);
        setEditingSchedule(null);
    };

    const handleSaveSchedule = async () => {
        if (!scheduleForm.zoneName.trim()) {
            toast.error('Please enter a zone name');
            return;
        }

        const waterAmount = scheduleForm.waterLevel === 'custom'
            ? scheduleForm.customWaterAmount
            : waterLevelPresets[scheduleForm.waterLevel].liters;

        const scheduleData = {
            zone: { name: scheduleForm.zoneName },
            plantType: scheduleForm.plantType,
            frequency: scheduleForm.frequency,
            time: {
                start: scheduleForm.startTime,
                duration: scheduleForm.duration
            },
            waterLevel: scheduleForm.waterLevel,
            waterAmount: { value: waterAmount, unit: 'liters' },
            scheduleType: scheduleForm.scheduleType,
            isActive: true
        };

        try {
            if (editingSchedule) {
                const response = await irrigationService.updateSchedule(editingSchedule._id, scheduleData);
                setSchedules(prev => prev.map(s => s._id === editingSchedule._id ? response.data : s));
                toast.success('Schedule updated successfully!');
            } else {
                const response = await irrigationService.createSchedule(scheduleData);
                setSchedules(prev => [...prev, response.data]);
                toast.success('Schedule created successfully!');
            }
            closeScheduleModal();
        } catch (error) {
            toast.error(editingSchedule ? 'Failed to update schedule' : 'Failed to create schedule');
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        if (!confirm('Are you sure you want to delete this schedule?')) return;

        try {
            await irrigationService.deleteSchedule(scheduleId);
            setSchedules(prev => prev.filter(s => s._id !== scheduleId));
            toast.success('Schedule deleted');
        } catch (error) {
            toast.error('Failed to delete schedule');
        }
    };

    const handleToggleSchedule = async (schedule) => {
        try {
            const response = await irrigationService.updateSchedule(schedule._id, { isActive: !schedule.isActive });
            setSchedules(prev => prev.map(s => s._id === schedule._id ? response.data : s));
            toast.success(response.data.isActive ? 'Schedule activated' : 'Schedule paused');
        } catch (error) {
            toast.error('Failed to update schedule');
        }
    };

    const getFrequencyLabel = (freq) => {
        const labels = {
            daily: 'Daily',
            alternate_days: 'Alternate Days',
            weekly: 'Weekly',
            custom: 'Custom'
        };
        return labels[freq] || freq;
    };

    const getWaterLevelColor = (level) => {
        const colors = {
            low: '#10b981',
            medium: '#3b82f6',
            high: '#f59e0b',
            custom: '#8b5cf6'
        };
        return colors[level] || '#6b7280';
    };


    const getSensorIcon = (type) => {
        switch (type) {
            case 'soil_moisture': return <FiDroplet />;
            case 'temperature': return <FiThermometer />;
            case 'humidity': return <FiCloud />;
            default: return <FiActivity />;
        }
    };

    const getSensorColor = (type) => {
        switch (type) {
            case 'soil_moisture': return 'blue';
            case 'temperature': return 'orange';
            case 'humidity': return 'cyan';
            case 'ph': return 'purple';
            default: return 'green';
        }
    };

    const getStatusClass = (status) => {
        if (status === 'critical') return 'critical';
        if (status === 'warning') return 'warning';
        return 'normal';
    };

    const onlineDevices = devices.filter(d => d.isOnline).length;
    const totalSensors = sensors.length;
    const onlineSensors = sensors.filter(s => s.isOnline).length;

    return (
        <div className="irrigation-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">💧 {t('nav.irrigation')}</h1>
                    <p className="page-subtitle">
                        {t('irrigation.subtitle') || 'Real-time IoT sensor monitoring and irrigation control'}
                    </p>
                </div>
                <div className="header-actions">
                    <Button
                        icon={<FiRefreshCw className={refreshing ? 'spinning' : ''} />}
                        variant="ghost"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Button icon={<FiPlus />} onClick={() => setShowDeviceModal(true)}>
                        Add Device
                    </Button>
                </div>
            </div>

            {/* Status Bar */}
            <div className="status-bar">
                <div className="status-item">
                    <FiCpu />
                    <span>{onlineDevices}/{devices.length} devices online</span>
                </div>
                <div className="status-item">
                    <FiActivity />
                    <span>{onlineSensors}/{totalSensors} sensors active</span>
                </div>
                {lastUpdated && (
                    <div className="status-item">
                        <FiRefreshCw />
                        <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                    </div>
                )}
            </div>

            {/* Real-time Sensor Cards */}
            <div className="sensors-grid">
                {sensors.length > 0 ? (
                    sensors.map((sensor, index) => (
                        <div key={index} className={`sensor-card sensor-${getSensorColor(sensor.sensorType)} ${getStatusClass(sensor.status)}`}>
                            <div className="sensor-header">
                                <div className="sensor-icon">{getSensorIcon(sensor.sensorType)}</div>
                                <span className={`online-indicator ${sensor.isOnline ? 'online' : 'offline'}`}>
                                    {sensor.isOnline ? <FiWifi /> : <FiWifiOff />}
                                </span>
                            </div>
                            <div className="sensor-info">
                                <span className="sensor-label">{sensor.name || sensor.sensorType?.replace('_', ' ')}</span>
                                <span className="sensor-value">
                                    {sensor.value !== null ? sensor.value.toFixed(1) : '--'}{sensor.unit}
                                </span>
                                <span className="sensor-zone">{sensor.zone || sensor.deviceName}</span>
                                <span className={`sensor-status ${sensor.status}`}>{sensor.status}</span>
                            </div>
                            {sensor.lastUpdated && (
                                <div className="sensor-timestamp">
                                    {new Date(sensor.lastUpdated).toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-sensors-message">
                        <FiWifiOff size={48} />
                        <h3>No IoT Sensors Connected</h3>
                        <p>Register a device and connect your IoT sensors to start monitoring</p>
                        <Button icon={<FiPlus />} onClick={() => setShowDeviceModal(true)}>
                            Add Your First Device
                        </Button>
                    </div>
                )}
            </div>

            <div className="irrigation-grid">
                {/* Sensor History Chart */}
                <Card title={t('irrigation.soilMoisture24h') || 'Sensor Data - Last 24 Hours'}>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={sensorHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} tickFormatter={(val) => new Date(val).getHours() + ':00'} />
                                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                                <Tooltip formatter={(val) => [`${val}%`, t('dashboard.soilMoisture') || 'Moisture']} />
                                <Area type="monotone" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Registered Devices */}
                <Card title="IoT Devices" icon={<FiCpu />}>
                    {devices.length > 0 ? (
                        <div className="devices-list">
                            {devices.map((device) => (
                                <div key={device.deviceId} className="device-item">
                                    <div className="device-info">
                                        <div className="device-header">
                                            <span className={`device-status ${device.isOnline ? 'online' : 'offline'}`}>
                                                {device.isOnline ? <FiWifi /> : <FiWifiOff />}
                                            </span>
                                            <strong>{device.deviceName}</strong>
                                        </div>
                                        <span className="device-id">{device.deviceId}</span>
                                        <span className="device-type">{device.deviceType?.toUpperCase()}</span>
                                    </div>
                                    <div className="device-actions">
                                        <button className="icon-btn" title="Settings">
                                            <FiSettings />
                                        </button>
                                        <button
                                            className="icon-btn danger"
                                            title="Delete"
                                            onClick={() => handleDeleteDevice(device.deviceId)}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-devices">
                            <p>No devices registered yet</p>
                            <Button size="sm" onClick={() => setShowDeviceModal(true)}>
                                Register Device
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Water Usage */}
                <Card title={t('irrigation.waterUsage') || 'Water Usage Analytics'}>
                    <div className="analytics-stats">
                        <div className="analytics-stat">
                            <span className="stat-value">{analytics?.totalWaterUsed?.toLocaleString() || '0'}L</span>
                            <span className="stat-label">{t('irrigation.thisMonth') || 'This Month'}</span>
                        </div>
                        <div className="analytics-stat">
                            <span className="stat-value">{analytics?.averageDaily || 0}L</span>
                            <span className="stat-label">{t('irrigation.dailyAvg') || 'Daily Avg'}</span>
                        </div>
                        <div className="analytics-stat highlight">
                            <span className="stat-value">{analytics?.savedComparedToManual || 0}%</span>
                            <span className="stat-label">{t('irrigation.waterSaved') || 'Water Saved'}</span>
                        </div>
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card title={t('irrigation.quickControls') || 'Quick Controls'}>
                    <div className="quick-controls">
                        <Button icon={<FiPlay />} fullWidth>{t('irrigation.startZoneA') || 'Start Zone A'}</Button>
                        <Button icon={<FiPlay />} variant="secondary" fullWidth>{t('irrigation.startZoneB') || 'Start Zone B'}</Button>
                        <Button icon={<FiPause />} variant="ghost" fullWidth>{t('irrigation.stopAll') || 'Stop All'}</Button>
                    </div>
                </Card>
            </div>

            {/* Irrigation Schedules Section */}
            <div className="schedules-section">
                <div className="section-header">
                    <h2><FiCalendar /> Irrigation Schedules</h2>
                    <Button icon={<FiPlus />} onClick={() => openScheduleModal()}>
                        Add Schedule
                    </Button>
                </div>

                {schedules.length > 0 ? (
                    <div className="schedules-grid">
                        {schedules.map((schedule) => (
                            <div key={schedule._id} className={`schedule-card ${!schedule.isActive ? 'inactive' : ''}`}>
                                <div className="schedule-header">
                                    <div className="schedule-zone">
                                        <FiDroplet style={{ color: getWaterLevelColor(schedule.waterLevel) }} />
                                        <span>{schedule.zone?.name || 'Unnamed Zone'}</span>
                                    </div>
                                    <button
                                        className="toggle-btn"
                                        onClick={() => handleToggleSchedule(schedule)}
                                        title={schedule.isActive ? 'Pause Schedule' : 'Activate Schedule'}
                                    >
                                        {schedule.isActive ? <FiToggleRight className="active" /> : <FiToggleLeft />}
                                    </button>
                                </div>

                                <div className="schedule-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Plant Type</span>
                                        <span className="detail-value">{schedule.plantType || 'General'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Frequency</span>
                                        <span className="detail-value">{getFrequencyLabel(schedule.frequency)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Time</span>
                                        <span className="detail-value">
                                            <FiClock size={12} /> {schedule.time?.start || '--:--'} ({schedule.time?.duration || 0} min)
                                        </span>
                                    </div>
                                </div>

                                <div className="water-level-indicator">
                                    <span className="level-label">Water Level</span>
                                    <div className="level-bar">
                                        <div
                                            className="level-fill"
                                            style={{
                                                width: schedule.waterLevel === 'low' ? '33%' :
                                                    schedule.waterLevel === 'medium' ? '66%' :
                                                        schedule.waterLevel === 'high' ? '100%' : '50%',
                                                backgroundColor: getWaterLevelColor(schedule.waterLevel)
                                            }}
                                        />
                                    </div>
                                    <span className="level-text" style={{ color: getWaterLevelColor(schedule.waterLevel) }}>
                                        {waterLevelPresets[schedule.waterLevel]?.label || 'Medium'}
                                        {' • '}{schedule.waterAmount?.value || waterLevelPresets[schedule.waterLevel]?.liters || 100}L
                                    </span>
                                </div>

                                <div className="schedule-actions">
                                    <button className="icon-btn" onClick={() => openScheduleModal(schedule)} title="Edit">
                                        <FiEdit3 />
                                    </button>
                                    <button className="icon-btn danger" onClick={() => handleDeleteSchedule(schedule._id)} title="Delete">
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-schedules-message">
                        <FiCalendar size={48} />
                        <h3>No Irrigation Schedules</h3>
                        <p>Create a schedule to automate watering for your plants</p>
                        <Button icon={<FiPlus />} onClick={() => openScheduleModal()}>
                            Create Your First Schedule
                        </Button>
                    </div>
                )}
            </div>

            {/* Device Registration Modal */}
            {showDeviceModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal device-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <FiCpu size={24} />
                            <h3>{registeredDevice ? 'Device Registered!' : 'Register IoT Device'}</h3>
                        </div>
                        <div className="modal-body">
                            {registeredDevice ? (
                                <div className="registration-success">
                                    <div className="success-icon"><FiCheck size={48} /></div>
                                    <p>Your device has been registered. Use the credentials below to connect:</p>

                                    <div className="credential-box">
                                        <label>Device ID</label>
                                        <div className="credential-value">
                                            <code>{registeredDevice.deviceId}</code>
                                        </div>
                                    </div>

                                    <div className="credential-box">
                                        <label>API Key (save this - shown only once!)</label>
                                        <div className="credential-value api-key">
                                            <code>{registeredDevice.apiKey}</code>
                                            <button onClick={() => copyApiKey(registeredDevice.apiKey)}>
                                                {copiedKey ? <FiCheck /> : <FiCopy />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="api-usage-example">
                                        <label>Example API Call (ESP32/Arduino):</label>
                                        <pre>{`POST /api/iot/data
Headers: X-API-KEY: ${registeredDevice.apiKey?.substring(0, 20)}...
Body: {
  "sensors": [
    {"sensorId": "S1", "sensorType": "soil_moisture", "value": 45},
    {"sensorId": "S2", "sensorType": "temperature", "value": 28}
  ]
}`}</pre>
                                    </div>
                                </div>
                            ) : (
                                <div className="registration-form">
                                    <div className="form-group">
                                        <label>Device Name</label>
                                        <input
                                            type="text"
                                            value={newDevice.deviceName}
                                            onChange={(e) => setNewDevice(p => ({ ...p, deviceName: e.target.value }))}
                                            placeholder="e.g., Field Sensor Node 1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Device Type</label>
                                        <select
                                            value={newDevice.deviceType}
                                            onChange={(e) => setNewDevice(p => ({ ...p, deviceType: e.target.value }))}
                                        >
                                            <option value="esp32">ESP32</option>
                                            <option value="esp8266">ESP8266</option>
                                            <option value="arduino">Arduino</option>
                                            <option value="raspberry_pi">Raspberry Pi</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <Button variant="secondary" onClick={closeModal}>
                                <FiX /> {registeredDevice ? 'Close' : 'Cancel'}
                            </Button>
                            {!registeredDevice && (
                                <Button onClick={handleRegisterDevice}>
                                    <FiCheck /> Register Device
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className="modal-overlay" onClick={closeScheduleModal}>
                    <div className="modal schedule-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <FiCalendar size={24} />
                            <h3>{editingSchedule ? 'Edit Schedule' : 'Create Irrigation Schedule'}</h3>
                        </div>
                        <div className="modal-body">
                            <div className="schedule-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Zone Name</label>
                                        <input
                                            type="text"
                                            value={scheduleForm.zoneName}
                                            onChange={(e) => setScheduleForm(p => ({ ...p, zoneName: e.target.value }))}
                                            placeholder="e.g., Zone A, North Field"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Plant Type</label>
                                        <select
                                            value={scheduleForm.plantType}
                                            onChange={(e) => setScheduleForm(p => ({ ...p, plantType: e.target.value }))}
                                        >
                                            {plantTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Frequency</label>
                                        <select
                                            value={scheduleForm.frequency}
                                            onChange={(e) => setScheduleForm(p => ({ ...p, frequency: e.target.value }))}
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="alternate_days">Alternate Days</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="custom">Custom Days</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Start Time</label>
                                        <input
                                            type="time"
                                            value={scheduleForm.startTime}
                                            onChange={(e) => setScheduleForm(p => ({ ...p, startTime: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Duration (min)</label>
                                        <input
                                            type="number"
                                            min="5"
                                            max="180"
                                            value={scheduleForm.duration}
                                            onChange={(e) => setScheduleForm(p => ({ ...p, duration: parseInt(e.target.value) || 30 }))}
                                        />
                                    </div>
                                </div>

                                <div className="water-level-section">
                                    <label>Water Level</label>
                                    <div className="water-level-options">
                                        {Object.entries(waterLevelPresets).map(([key, preset]) => (
                                            <div
                                                key={key}
                                                className={`water-option ${scheduleForm.waterLevel === key ? 'selected' : ''}`}
                                                onClick={() => setScheduleForm(p => ({ ...p, waterLevel: key }))}
                                                style={{ '--level-color': getWaterLevelColor(key) }}
                                            >
                                                <FiDroplet />
                                                <span className="option-label">{preset.label}</span>
                                                <span className="option-value">
                                                    {key === 'custom' ? 'Custom' : `${preset.liters}L/m²`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    {scheduleForm.waterLevel === 'custom' && (
                                        <div className="custom-water-input">
                                            <label>Custom Water Amount (Liters)</label>
                                            <input
                                                type="number"
                                                min="10"
                                                max="500"
                                                value={scheduleForm.customWaterAmount}
                                                onChange={(e) => setScheduleForm(p => ({ ...p, customWaterAmount: parseInt(e.target.value) || 100 }))}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <Button variant="secondary" onClick={closeScheduleModal}>
                                <FiX /> Cancel
                            </Button>
                            <Button onClick={handleSaveSchedule}>
                                <FiCheck /> {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Irrigation;
