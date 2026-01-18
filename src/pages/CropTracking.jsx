import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import {
    FiCalendar, FiCheck, FiClock, FiAlertCircle,
    FiChevronDown, FiChevronUp, FiTrash2, FiEye, FiRefreshCw
} from 'react-icons/fi';
import { GiPlantRoots, GiWateringCan, GiFarmTractor } from 'react-icons/gi';
import toast from 'react-hot-toast';
import './CropTracking.css';

const CropTracking = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [expandedSchedule, setExpandedSchedule] = useState(null);
    const [scheduleDetails, setScheduleDetails] = useState({});
    const [updatingActivity, setUpdatingActivity] = useState(null);

    // Fetch user schedules
    useEffect(() => {
        fetchSchedules();
    }, [activeTab]);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/crop-schedules?status=${activeTab}`);
            if (response.data.success) {
                setSchedules(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
            toast.error('Failed to load schedules');
        } finally {
            setLoading(false);
        }
    };

    // Fetch schedule details with activities
    const fetchScheduleDetails = async (scheduleId) => {
        if (scheduleDetails[scheduleId]) {
            return scheduleDetails[scheduleId];
        }

        try {
            const response = await api.get(`/crop-schedules/${scheduleId}`);
            if (response.data.success) {
                setScheduleDetails(prev => ({
                    ...prev,
                    [scheduleId]: response.data.data
                }));
                return response.data.data;
            }
        } catch (error) {
            console.error('Error fetching schedule details:', error);
            toast.error('Failed to load schedule details');
        }
        return null;
    };

    // Toggle schedule expansion
    const toggleSchedule = async (scheduleId) => {
        if (expandedSchedule === scheduleId) {
            setExpandedSchedule(null);
        } else {
            setExpandedSchedule(scheduleId);
            await fetchScheduleDetails(scheduleId);
        }
    };

    // Update activity status
    const updateActivityStatus = async (scheduleId, activityId, newStatus) => {
        setUpdatingActivity(activityId);
        try {
            const response = await api.patch(`/crop-schedules/${scheduleId}/activities/${activityId}`, {
                status: newStatus
            });

            if (response.data.success) {
                // Update local state
                setScheduleDetails(prev => ({
                    ...prev,
                    [scheduleId]: response.data.data
                }));

                // Update schedules list if status changed to completed
                if (response.data.data.status === 'completed') {
                    fetchSchedules();
                }

                toast.success('Activity updated!');
            }
        } catch (error) {
            console.error('Error updating activity:', error);
            toast.error('Failed to update activity');
        } finally {
            setUpdatingActivity(null);
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
                setSchedules(prev => prev.filter(s => s._id !== scheduleId));
                toast.success('Schedule deleted');
            }
        } catch (error) {
            console.error('Error deleting schedule:', error);
            toast.error('Failed to delete schedule');
        }
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'active': return 'status-active';
            case 'completed': return 'status-completed';
            case 'planning': return 'status-planning';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    // Get activity status class
    const getActivityStatusClass = (activity) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activityDate = new Date(activity.scheduledDate);
        activityDate.setHours(0, 0, 0, 0);

        if (activity.status === 'completed') return 'completed';
        if (activity.status === 'skipped') return 'skipped';
        if (activityDate < today) return 'overdue';
        if (activityDate.getTime() === today.getTime()) return 'today';
        return 'upcoming';
    };

    // Group activities by stage
    const groupActivitiesByStage = (activities) => {
        const grouped = {};
        activities.forEach(activity => {
            if (!grouped[activity.stageName]) {
                grouped[activity.stageName] = [];
            }
            grouped[activity.stageName].push(activity);
        });
        return grouped;
    };

    return (
        <div className="crop-tracking-page">
            <div className="page-header">
                <h1 className="page-title">📊 {t('tracking.title') || 'Crop Tracking'}</h1>
                <p className="page-subtitle">{t('tracking.subtitle') || 'Track and manage your active crop schedules'}</p>
            </div>

            {/* Tabs */}
            <div className="tracking-tabs">
                <button
                    className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    <FiClock /> Active
                </button>
                <button
                    className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    <FiCheck /> Completed
                </button>
                <button
                    className={`tab-btn ${activeTab === 'planning' ? 'active' : ''}`}
                    onClick={() => setActiveTab('planning')}
                >
                    <FiCalendar /> Planning
                </button>
            </div>

            {/* Create New Schedule Button */}
            <div className="action-bar">
                <button
                    className="new-schedule-btn"
                    onClick={() => navigate('/crops/schedule')}
                >
                    <GiPlantRoots /> Create New Schedule
                </button>
                <button className="refresh-btn" onClick={fetchSchedules}>
                    <FiRefreshCw className={loading ? 'spin' : ''} />
                </button>
            </div>

            {/* Schedules List */}
            <div className="schedules-container">
                {loading ? (
                    <div className="loading-state">
                        <FiRefreshCw className="spin" />
                        <span>Loading schedules...</span>
                    </div>
                ) : schedules.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h3>No {activeTab} schedules</h3>
                        <p>
                            {activeTab === 'active'
                                ? 'Create a new schedule to start tracking your crops'
                                : `You don't have any ${activeTab} schedules yet`}
                        </p>
                        {activeTab === 'active' && (
                            <button
                                className="new-schedule-btn"
                                onClick={() => navigate('/crops/schedule')}
                            >
                                <GiPlantRoots /> Create Schedule
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="schedules-list">
                        {schedules.map(schedule => (
                            <Card key={schedule._id} className="schedule-card">
                                <div className="schedule-header" onClick={() => toggleSchedule(schedule._id)}>
                                    <div className="schedule-info">
                                        <div className="schedule-crop">
                                            <GiPlantRoots className="crop-icon" />
                                            <h3>{schedule.cropName}</h3>
                                            <span className={`status-badge ${getStatusBadgeClass(schedule.status)}`}>
                                                {schedule.status}
                                            </span>
                                        </div>
                                        <div className="schedule-dates">
                                            <span><FiCalendar /> Start: {formatDate(schedule.startDate)}</span>
                                            <span><GiFarmTractor /> Harvest: {formatDate(schedule.expectedHarvestDate)}</span>
                                        </div>
                                    </div>
                                    <div className="schedule-progress">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${schedule.progressPercentage || 0}%` }}
                                            />
                                        </div>
                                        <span className="progress-text">{schedule.progressPercentage || 0}%</span>
                                    </div>
                                    <div className="schedule-actions">
                                        <button
                                            className="action-btn delete"
                                            onClick={(e) => { e.stopPropagation(); deleteSchedule(schedule._id); }}
                                            title="Delete schedule"
                                        >
                                            <FiTrash2 />
                                        </button>
                                        <span className="expand-icon">
                                            {expandedSchedule === schedule._id ? <FiChevronUp /> : <FiChevronDown />}
                                        </span>
                                    </div>
                                </div>

                                {/* Expanded Activities */}
                                {expandedSchedule === schedule._id && scheduleDetails[schedule._id] && (
                                    <div className="schedule-activities">
                                        {Object.entries(groupActivitiesByStage(scheduleDetails[schedule._id].activities)).map(([stageName, activities]) => (
                                            <div key={stageName} className="stage-group">
                                                <h4 className="stage-title">
                                                    <GiWateringCan /> {stageName}
                                                </h4>
                                                <div className="activities-list">
                                                    {activities.map(activity => (
                                                        <div
                                                            key={activity._id}
                                                            className={`activity-item ${getActivityStatusClass(activity)}`}
                                                        >
                                                            <div
                                                                className="activity-checkbox"
                                                                onClick={() => {
                                                                    if (activity.status !== 'completed') {
                                                                        updateActivityStatus(schedule._id, activity._id, 'completed');
                                                                    }
                                                                }}
                                                            >
                                                                {updatingActivity === activity._id ? (
                                                                    <FiRefreshCw className="spin" />
                                                                ) : activity.status === 'completed' ? (
                                                                    <FiCheck />
                                                                ) : null}
                                                            </div>
                                                            <div className="activity-content">
                                                                <span className="activity-name">{activity.activityName}</span>
                                                                <span className="activity-date">
                                                                    {formatDate(activity.scheduledDate)}
                                                                    {getActivityStatusClass(activity) === 'overdue' && (
                                                                        <span className="overdue-tag">Overdue</span>
                                                                    )}
                                                                    {getActivityStatusClass(activity) === 'today' && (
                                                                        <span className="today-tag">Today</span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="activity-status-actions">
                                                                {activity.status !== 'completed' && activity.status !== 'skipped' && (
                                                                    <button
                                                                        className="skip-btn"
                                                                        onClick={() => updateActivityStatus(schedule._id, activity._id, 'skipped')}
                                                                        title="Skip activity"
                                                                    >
                                                                        Skip
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CropTracking;
