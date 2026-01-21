import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import { useLanguage } from '../context/LanguageContext';
import {
    FiCalendar, FiCheck, FiClock, FiAlertCircle,
    FiChevronDown, FiChevronUp, FiRefreshCw, FiArrowLeft, FiTrash2, FiEye
} from 'react-icons/fi';
import { GiPlantRoots, GiWateringCan, GiFarmTractor } from 'react-icons/gi';
import toast from 'react-hot-toast';
import api from '../services/api';
import './CropScheduler.css';

// Crop schedule data (matching backend)
const CROP_SCHEDULES = {
    'Rice': {
        duration: { min: 120, max: 150 },
        stages: [
            {
                name: 'Land Preparation', dayOffset: -20, duration: 20, activities: [
                    { task: 'Deep ploughing followed by puddling', day: 0 },
                    { task: 'Level field for uniform water distribution', day: 5 },
                    { task: 'Apply FYM 5-6 tons/acre', day: 10 }
                ]
            },
            {
                name: 'Nursery Preparation', dayOffset: -25, duration: 25, activities: [
                    { task: 'Prepare nursery beds', day: 0 },
                    { task: 'Soak and treat seeds', day: 1 },
                    { task: 'Sow seeds in nursery', day: 2 }
                ]
            },
            {
                name: 'Transplanting', dayOffset: 0, duration: 7, activities: [
                    { task: 'Transplant seedlings to main field', day: 0 },
                    { task: 'Maintain 5-7 cm water depth', day: 2 }
                ]
            },
            {
                name: 'Fertilizer & Weeding', dayOffset: 20, duration: 45, activities: [
                    { task: 'First weeding', day: 0 },
                    { task: 'Apply nitrogen at tillering', day: 5 },
                    { task: 'Second weeding', day: 20 },
                    { task: 'Apply nitrogen at panicle stage', day: 25 }
                ]
            },
            {
                name: 'Harvesting', dayOffset: 120, duration: 15, activities: [
                    { task: 'Check 80% grains golden yellow', day: 0 },
                    { task: 'Harvest and dry', day: 5 }
                ]
            }
        ]
    },
    'Wheat': {
        duration: { min: 120, max: 150 },
        stages: [
            {
                name: 'Land Preparation', dayOffset: -15, duration: 15, activities: [
                    { task: '2-3 deep ploughings', day: 0 },
                    { task: 'Apply FYM 4-5 tons/acre', day: 10 }
                ]
            },
            {
                name: 'Sowing', dayOffset: 0, duration: 3, activities: [
                    { task: 'Sow seeds at 5-6 cm depth', day: 0 },
                    { task: 'Apply basal fertilizer', day: 0 }
                ]
            },
            {
                name: 'Irrigation & Fertilizer', dayOffset: 20, duration: 100, activities: [
                    { task: 'First irrigation (CRI stage)', day: 0 },
                    { task: 'First nitrogen top dressing', day: 5 },
                    { task: 'Weeding', day: 15 },
                    { task: 'Second irrigation at tillering', day: 25 }
                ]
            },
            {
                name: 'Harvesting', dayOffset: 120, duration: 15, activities: [
                    { task: 'Harvest when grains harden', day: 0 },
                    { task: 'Dry to 12% moisture', day: 10 }
                ]
            }
        ]
    },
    'Maize': {
        duration: { min: 90, max: 110 },
        stages: [
            {
                name: 'Land Preparation', dayOffset: -10, duration: 10, activities: [
                    { task: '2-3 ploughings', day: 0 },
                    { task: 'Make ridges', day: 8 }
                ]
            },
            {
                name: 'Sowing', dayOffset: 0, duration: 3, activities: [
                    { task: 'Sow seeds with basal fertilizer', day: 0 }
                ]
            },
            {
                name: 'Early Growth', dayOffset: 15, duration: 30, activities: [
                    { task: 'Thinning', day: 5 },
                    { task: 'First weeding', day: 10 },
                    { task: 'Earthing up', day: 20 }
                ]
            },
            {
                name: 'Harvesting', dayOffset: 90, duration: 15, activities: [
                    { task: 'Harvest when silks turn brown', day: 0 }
                ]
            }
        ]
    },
    'Potato': {
        duration: { min: 90, max: 120 },
        stages: [
            {
                name: 'Land Preparation', dayOffset: -15, duration: 15, activities: [
                    { task: '3-4 ploughings', day: 0 },
                    { task: 'Make ridges', day: 12 }
                ]
            },
            {
                name: 'Planting', dayOffset: 0, duration: 3, activities: [
                    { task: 'Cut and treat seed potatoes', day: -1 },
                    { task: 'Plant at 8 inch spacing', day: 0 }
                ]
            },
            {
                name: 'Growth & Tuber Formation', dayOffset: 20, duration: 70, activities: [
                    { task: 'Earthing up', day: 5 },
                    { task: 'First fertilizer', day: 10 },
                    { task: 'Watch for late blight', day: 30 }
                ]
            },
            {
                name: 'Harvesting', dayOffset: 90, duration: 15, activities: [
                    { task: 'Harvest when leaves yellow', day: 0 }
                ]
            }
        ]
    },
    'Tomato': {
        duration: { min: 120, max: 150 },
        stages: [
            {
                name: 'Nursery', dayOffset: -30, duration: 30, activities: [
                    { task: 'Prepare nursery beds', day: 0 },
                    { task: 'Sow seeds', day: 2 },
                    { task: 'Seedlings ready', day: 25 }
                ]
            },
            {
                name: 'Transplanting', dayOffset: 0, duration: 7, activities: [
                    { task: 'Transplant to main field', day: 0 },
                    { task: 'Gap filling', day: 7 }
                ]
            },
            {
                name: 'Staking & Growth', dayOffset: 15, duration: 30, activities: [
                    { task: 'Install stakes', day: 0 },
                    { task: 'First fertilizer', day: 10 },
                    { task: 'Start pruning', day: 15 }
                ]
            },
            {
                name: 'Harvesting', dayOffset: 80, duration: 60, activities: [
                    { task: 'First harvest', day: 0 },
                    { task: 'Continue picking every 3-4 days', day: 10 }
                ]
            }
        ]
    },
    'Sugarcane': {
        duration: { min: 360, max: 450 },
        stages: [
            {
                name: 'Land Preparation', dayOffset: -20, duration: 20, activities: [
                    { task: 'Deep ploughing', day: 0 },
                    { task: 'Prepare furrows', day: 15 }
                ]
            },
            {
                name: 'Planting', dayOffset: 0, duration: 7, activities: [
                    { task: 'Treat and plant setts', day: 0 }
                ]
            },
            {
                name: 'Early Growth', dayOffset: 30, duration: 90, activities: [
                    { task: 'Gap filling', day: 0 },
                    { task: 'First weeding', day: 10 },
                    { task: 'Earthing up', day: 50 }
                ]
            },
            {
                name: 'Grand Growth', dayOffset: 120, duration: 180, activities: [
                    { task: 'Regular irrigation', day: 0 },
                    { task: 'Watch for borers', day: 30 }
                ]
            },
            {
                name: 'Harvesting', dayOffset: 360, duration: 30, activities: [
                    { task: 'Test sugar content', day: 0 },
                    { task: 'Harvest and send to mill', day: 10 }
                ]
            }
        ]
    },
    'Groundnut': {
        duration: { min: 110, max: 140 },
        stages: [
            {
                name: 'Land Preparation', dayOffset: -15, duration: 15, activities: [
                    { task: 'Deep ploughing', day: 0 }
                ]
            },
            {
                name: 'Sowing', dayOffset: 0, duration: 3, activities: [
                    { task: 'Treat seeds with Rhizobium', day: 0 },
                    { task: 'Apply gypsum', day: 0 }
                ]
            },
            {
                name: 'Flowering & Pod Dev', dayOffset: 40, duration: 70, activities: [
                    { task: 'Earthing up', day: -10 },
                    { task: 'Keep soil loose for pegging', day: 5 }
                ]
            },
            {
                name: 'Harvesting', dayOffset: 110, duration: 15, activities: [
                    { task: 'Dig and dry pods', day: 0 }
                ]
            }
        ]
    },
    'Cotton': {
        duration: { min: 150, max: 180 },
        stages: [
            {
                name: 'Land Preparation', dayOffset: -30, duration: 30, activities: [
                    { task: 'Summer ploughing', day: 0 }
                ]
            },
            {
                name: 'Sowing', dayOffset: 0, duration: 5, activities: [
                    { task: 'Treat seeds and sow', day: 0 }
                ]
            },
            {
                name: 'Growth', dayOffset: 20, duration: 85, activities: [
                    { task: 'Thinning', day: 0 },
                    { task: 'First weeding', day: 5 },
                    { task: 'Watch for bollworm', day: 60 }
                ]
            },
            {
                name: 'Picking', dayOffset: 150, duration: 45, activities: [
                    { task: 'First picking', day: 0 },
                    { task: 'Second picking', day: 20 }
                ]
            }
        ]
    },
    'Chilli': {
        duration: { min: 150, max: 210 },
        stages: [
            {
                name: 'Nursery', dayOffset: -40, duration: 40, activities: [
                    { task: 'Prepare and sow nursery', day: 0 }
                ]
            },
            {
                name: 'Transplanting', dayOffset: 0, duration: 10, activities: [
                    { task: 'Transplant seedlings', day: 0 }
                ]
            },
            {
                name: 'Growth & Flowering', dayOffset: 25, duration: 55, activities: [
                    { task: 'First fertilizer', day: 0 },
                    { task: 'Spray for thrips', day: 25 }
                ]
            },
            {
                name: 'Harvesting', dayOffset: 80, duration: 90, activities: [
                    { task: 'Start picking', day: 0 },
                    { task: 'Continue 6-10 pickings', day: 30 }
                ]
            }
        ]
    },
    'Cucumber': {
        duration: { min: 60, max: 75 },
        stages: [
            {
                name: 'Land Preparation', dayOffset: -10, duration: 10, activities: [
                    { task: 'Make pits with FYM', day: 0 }
                ]
            },
            {
                name: 'Sowing', dayOffset: 0, duration: 5, activities: [
                    { task: 'Sow 2-3 seeds per pit', day: 0 }
                ]
            },
            {
                name: 'Growth', dayOffset: 10, duration: 35, activities: [
                    { task: 'Provide support/bower', day: 5 },
                    { task: 'First fertilizer', day: 10 }
                ]
            },
            {
                name: 'Harvesting', dayOffset: 50, duration: 35, activities: [
                    { task: 'Pick every 2-3 days', day: 0 }
                ]
            }
        ]
    },
    'Mustard': {
        duration: { min: 90, max: 120 },
        stages: [
            {
                name: 'Land Preparation', dayOffset: -10, duration: 10, activities: [
                    { task: '2-3 ploughings with FYM', day: 0 }
                ]
            },
            {
                name: 'Sowing', dayOffset: 0, duration: 3, activities: [
                    { task: 'Sow at 30-45x15 cm spacing', day: 0 }
                ]
            },
            {
                name: 'Care', dayOffset: 20, duration: 60, activities: [
                    { task: 'First weeding', day: 5 },
                    { task: 'Watch for aphids', day: 40 }
                ]
            },
            {
                name: 'Harvesting', dayOffset: 90, duration: 15, activities: [
                    { task: 'Harvest when 75% pods yellow', day: 0 }
                ]
            }
        ]
    },
    'Chickpea': {
        duration: { min: 120, max: 150 },
        stages: [
            {
                name: 'Land Preparation', dayOffset: -10, duration: 10, activities: [
                    { task: 'Light ploughing', day: 0 }
                ]
            },
            {
                name: 'Sowing', dayOffset: 0, duration: 3, activities: [
                    { task: 'Treat seeds with Rhizobium and sow', day: 0 }
                ]
            },
            {
                name: 'Care', dayOffset: 20, duration: 70, activities: [
                    { task: 'Weeding at 30-35 days', day: 15 },
                    { task: 'Watch for pod borer', day: 40 }
                ]
            },
            {
                name: 'Harvesting', dayOffset: 120, duration: 15, activities: [
                    { task: 'Harvest when 80% pods brown', day: 0 }
                ]
            }
        ]
    },
    'Sunflower': {
        duration: { min: 95, max: 120 },
        stages: [
            {
                name: 'Land Preparation', dayOffset: -10, duration: 10, activities: [
                    { task: 'Deep ploughing', day: 0 }
                ]
            },
            {
                name: 'Sowing', dayOffset: 0, duration: 5, activities: [
                    { task: 'Sow at 60x25 cm spacing', day: 0 }
                ]
            },
            {
                name: 'Growth & Flowering', dayOffset: 15, duration: 65, activities: [
                    { task: 'Thinning at 15-20 days', day: 0 },
                    { task: 'First fertilizer at 25-30 days', day: 15 },
                    { task: 'Bird protection during flowering', day: 50 }
                ]
            },
            {
                name: 'Harvesting', dayOffset: 95, duration: 15, activities: [
                    { task: 'Harvest when back of head brown', day: 0 }
                ]
            }
        ]
    }
};

// List of crops that have schedule data
const SCHEDULABLE_CROPS = Object.keys(CROP_SCHEDULES);

const CropScheduler = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const cropFromUrl = searchParams.get('crop');

    const [selectedCrop, setSelectedCrop] = useState(cropFromUrl || '');
    const [startDate, setStartDate] = useState('');
    const [schedule, setSchedule] = useState(null);
    const [expandedStages, setExpandedStages] = useState({});
    const [activityStatuses, setActivityStatuses] = useState({});
    const [loading, setLoading] = useState(false);
    const [savedScheduleId, setSavedScheduleId] = useState(null);
    const [savedSchedules, setSavedSchedules] = useState([]);
    const [loadingSchedules, setLoadingSchedules] = useState(true);

    // Check if the selected crop has schedule data
    const isCropSchedulable = selectedCrop && SCHEDULABLE_CROPS.includes(selectedCrop);

    // Fetch saved schedules on mount
    useEffect(() => {
        fetchSavedSchedules();
    }, []);

    const fetchSavedSchedules = async () => {
        setLoadingSchedules(true);
        try {
            const response = await api.get('/crop-schedules');
            if (response.data.success) {
                setSavedSchedules(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
        } finally {
            setLoadingSchedules(false);
        }
    };

    // Delete schedule
    const deleteSchedule = async (scheduleId) => {
        if (!window.confirm('Are you sure you want to delete this schedule?')) {
            return;
        }
        try {
            const response = await api.delete(`/crop-schedules/${scheduleId}`);
            if (response.data.success) {
                setSavedSchedules(prev => prev.filter(s => s._id !== scheduleId));
                toast.success('Schedule deleted');
            }
        } catch (error) {
            console.error('Error deleting schedule:', error);
            toast.error('Failed to delete schedule');
        }
    };

    // Generate schedule based on start date
    const generateSchedule = () => {
        if (!selectedCrop || !startDate) {
            toast.error('Please select a crop and start date');
            return;
        }

        if (!isCropSchedulable) {
            toast.error(`Schedule data not available for ${selectedCrop}`);
            return;
        }

        const cropData = CROP_SCHEDULES[selectedCrop];
        const start = new Date(startDate);

        const generatedSchedule = {
            cropName: selectedCrop,
            startDate: start,
            expectedHarvestDate: new Date(start.getTime() + cropData.duration.max * 24 * 60 * 60 * 1000),
            stages: cropData.stages.map(stage => ({
                ...stage,
                activities: stage.activities.map((activity, idx) => {
                    const activityDate = new Date(start);
                    activityDate.setDate(activityDate.getDate() + stage.dayOffset + activity.day);
                    return {
                        id: `${stage.name}-${idx}`,
                        ...activity,
                        scheduledDate: activityDate,
                        status: 'pending'
                    };
                })
            }))
        };

        setSchedule(generatedSchedule);

        // Initialize all stages as expanded
        const expanded = {};
        generatedSchedule.stages.forEach(stage => {
            expanded[stage.name] = true;
        });
        setExpandedStages(expanded);

        // Initialize activity statuses
        const statuses = {};
        generatedSchedule.stages.forEach(stage => {
            stage.activities.forEach(activity => {
                statuses[activity.id] = 'pending';
            });
        });
        setActivityStatuses(statuses);

        toast.success('Schedule generated successfully!');
    };

    // Toggle stage expansion
    const toggleStage = (stageName) => {
        setExpandedStages(prev => ({
            ...prev,
            [stageName]: !prev[stageName]
        }));
    };

    // Toggle activity status
    const toggleActivityStatus = (activityId) => {
        setActivityStatuses(prev => {
            const currentStatus = prev[activityId];
            const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
            return { ...prev, [activityId]: newStatus };
        });
    };

    // Calculate progress
    const progress = useMemo(() => {
        const statuses = Object.values(activityStatuses);
        if (statuses.length === 0) return 0;
        const completed = statuses.filter(s => s === 'completed').length;
        return Math.round((completed / statuses.length) * 100);
    }, [activityStatuses]);

    // Get activity status class
    const getActivityClass = (activity) => {
        const status = activityStatuses[activity.id];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activityDate = new Date(activity.scheduledDate);
        activityDate.setHours(0, 0, 0, 0);

        if (status === 'completed') return 'completed';
        if (activityDate < today) return 'overdue';
        if (activityDate.getTime() === today.getTime()) return 'today';
        return 'upcoming';
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Get upcoming activities (next 7 days)
    const upcomingActivities = useMemo(() => {
        if (!schedule) return [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const activities = [];
        schedule.stages.forEach(stage => {
            stage.activities.forEach(activity => {
                const activityDate = new Date(activity.scheduledDate);
                activityDate.setHours(0, 0, 0, 0);

                if (activityStatuses[activity.id] !== 'completed' && activityDate <= nextWeek) {
                    activities.push({
                        ...activity,
                        stageName: stage.name,
                        isOverdue: activityDate < today,
                        isToday: activityDate.getTime() === today.getTime()
                    });
                }
            });
        });

        return activities.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
    }, [schedule, activityStatuses]);

    // Save schedule to backend
    const saveSchedule = async () => {
        if (!schedule) return;

        setLoading(true);
        try {
            const response = await api.post('/crop-schedules', {
                cropName: selectedCrop,
                startDate: startDate
            });

            if (response.data.success) {
                setSavedScheduleId(response.data.data._id);
                toast.success('Schedule saved successfully!');
                fetchSavedSchedules(); // Refresh the saved schedules list
            } else {
                toast.error(response.data.message || 'Failed to save schedule');
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
            toast.error(error.response?.data?.message || 'Failed to save schedule');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="crop-scheduler-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate('/crops/recommend')}>
                    <FiArrowLeft /> {t('common.back') || 'Back to Recommendations'}
                </button>
                <h1 className="page-title">📅 {t('scheduler.title') || 'Crop Scheduler'}</h1>
                <p className="page-subtitle">{t('scheduler.subtitle') || 'Plan and track your crop activities from planting to harvest'}</p>
            </div>

            <div className="scheduler-layout">
                {/* Input Section */}
                <Card title="Schedule Setup" icon={<FiCalendar />} className="setup-card">
                    <div className="setup-form">
                        <div className="form-group">
                            <label><GiPlantRoots /> Select Crop</label>
                            <select
                                value={selectedCrop}
                                onChange={(e) => setSelectedCrop(e.target.value)}
                            >
                                <option value="">Choose a crop</option>
                                {SCHEDULABLE_CROPS.map(crop => (
                                    <option key={crop} value={crop}>{crop}</option>
                                ))}
                            </select>
                            {selectedCrop && CROP_SCHEDULES[selectedCrop] && (
                                <span className="field-hint">
                                    Duration: {CROP_SCHEDULES[selectedCrop].duration.min}-{CROP_SCHEDULES[selectedCrop].duration.max} days
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label><FiCalendar /> Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <button
                            className="generate-btn"
                            onClick={generateSchedule}
                            disabled={!selectedCrop || !startDate}
                        >
                            <FiRefreshCw /> Generate Schedule
                        </button>
                    </div>
                </Card>

                {/* Schedule Display */}
                {schedule && (
                    <>
                        {/* Summary Card */}
                        <Card className="summary-card">
                            <div className="summary-header">
                                <div className="crop-info">
                                    <h2>{schedule.cropName}</h2>
                                    <div className="date-range">
                                        <span><FiCalendar /> Start: {formatDate(schedule.startDate)}</span>
                                        <span><GiFarmTractor /> Expected Harvest: {formatDate(schedule.expectedHarvestDate)}</span>
                                    </div>
                                </div>
                                <div className="progress-circle">
                                    <svg viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.2)"
                                            strokeWidth="3"
                                        />
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#4ade80"
                                            strokeWidth="3"
                                            strokeDasharray={`${progress}, 100`}
                                        />
                                    </svg>
                                    <span className="progress-text">{progress}%</span>
                                </div>
                            </div>
                            <button
                                className="save-btn"
                                onClick={saveSchedule}
                                disabled={loading || savedScheduleId}
                            >
                                {savedScheduleId ? '✓ Saved' : loading ? 'Saving...' : 'Save Schedule'}
                            </button>
                        </Card>

                        {/* Reminders/Upcoming */}
                        {upcomingActivities.length > 0 && (
                            <Card title="📌 Upcoming Activities" className="reminders-card">
                                <div className="reminders-list">
                                    {upcomingActivities.slice(0, 5).map(activity => (
                                        <div
                                            key={activity.id}
                                            className={`reminder-item ${activity.isOverdue ? 'overdue' : ''} ${activity.isToday ? 'today' : ''}`}
                                        >
                                            <div className="reminder-icon">
                                                {activity.isOverdue ? <FiAlertCircle /> :
                                                    activity.isToday ? <FiClock /> : <FiCalendar />}
                                            </div>
                                            <div className="reminder-content">
                                                <span className="reminder-task">{activity.task}</span>
                                                <span className="reminder-meta">
                                                    {activity.stageName} • {formatDate(activity.scheduledDate)}
                                                    {activity.isOverdue && <span className="overdue-tag">Overdue</span>}
                                                    {activity.isToday && <span className="today-tag">Today</span>}
                                                </span>
                                            </div>
                                            <button
                                                className="complete-btn"
                                                onClick={() => toggleActivityStatus(activity.id)}
                                            >
                                                <FiCheck />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Timeline */}
                        <Card title="🗓️ Activity Timeline" className="timeline-card">
                            <div className="timeline">
                                {schedule.stages.map((stage, stageIdx) => (
                                    <div key={stage.name} className="timeline-stage">
                                        <div
                                            className="stage-header"
                                            onClick={() => toggleStage(stage.name)}
                                        >
                                            <div className="stage-icon">
                                                <GiWateringCan />
                                            </div>
                                            <div className="stage-info">
                                                <h3>{stage.name}</h3>
                                                <span className="stage-meta">
                                                    {stage.activities.length} activities •
                                                    {stage.activities.filter(a => activityStatuses[a.id] === 'completed').length} completed
                                                </span>
                                            </div>
                                            <span className="expand-icon">
                                                {expandedStages[stage.name] ? <FiChevronUp /> : <FiChevronDown />}
                                            </span>
                                        </div>

                                        {expandedStages[stage.name] && (
                                            <div className="stage-activities">
                                                {stage.activities.map(activity => (
                                                    <div
                                                        key={activity.id}
                                                        className={`activity-item ${getActivityClass(activity)}`}
                                                    >
                                                        <div
                                                            className="activity-checkbox"
                                                            onClick={() => toggleActivityStatus(activity.id)}
                                                        >
                                                            {activityStatuses[activity.id] === 'completed' ?
                                                                <FiCheck /> : null}
                                                        </div>
                                                        <div className="activity-content">
                                                            <span className="activity-task">{activity.task}</span>
                                                            <span className="activity-date">
                                                                {formatDate(activity.scheduledDate)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </>
                )}

                {/* Empty State */}
                {!schedule && (
                    <div className="empty-state">
                        <div className="empty-icon">📅</div>
                        <h3>Create Your Crop Schedule</h3>
                        <p>Select a crop and start date to generate a complete activity timeline from planting to harvest.</p>
                    </div>
                )}
            </div>

            {/* My Saved Schedules Section */}
            <div className="saved-schedules-section">
                <div className="section-header">
                    <h2>📋 My Saved Schedules</h2>
                    <button className="refresh-btn" onClick={fetchSavedSchedules} disabled={loadingSchedules}>
                        <FiRefreshCw className={loadingSchedules ? 'spin' : ''} />
                        <span>Refresh</span>
                    </button>
                </div>

                {loadingSchedules ? (
                    <div className="loading-schedules">
                        <FiRefreshCw className="spin" />
                        <span>Loading schedules...</span>
                    </div>
                ) : savedSchedules.length === 0 ? (
                    <div className="no-schedules">
                        <p>No saved schedules yet. Generate and save a schedule above to track your crops.</p>
                    </div>
                ) : (
                    <div className="saved-schedules-list">
                        {savedSchedules.map(s => (
                            <div key={s._id} className="saved-schedule-card">
                                <div className="schedule-card-info">
                                    <div className="schedule-crop-name">
                                        <GiPlantRoots />
                                        <h4>{s.cropName}</h4>
                                        <span className={`status-badge status-${s.status}`}>{s.status}</span>
                                    </div>
                                    <div className="schedule-dates-row">
                                        <span><FiCalendar /> {formatDate(s.startDate)}</span>
                                        <span><GiFarmTractor /> {formatDate(s.expectedHarvestDate)}</span>
                                    </div>
                                </div>
                                <div className="schedule-card-progress">
                                    <div className="mini-progress-bar">
                                        <div className="mini-progress-fill" style={{ width: `${s.progressPercentage || 0}%` }} />
                                    </div>
                                    <span className="progress-percentage">{s.progressPercentage || 0}%</span>
                                </div>
                                <div className="schedule-card-actions">
                                    <button
                                        className="view-btn"
                                        onClick={() => navigate(`/crops/tracking`)}
                                        title="View in tracking"
                                    >
                                        <FiEye />
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => deleteSchedule(s._id)}
                                        title="Delete schedule"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CropScheduler;
