import api from './api';

export const cropService = {
    getCrops: async (params = {}) => {
        const response = await api.get('/crops', { params });
        return response.data;
    },

    getCropById: async (id) => {
        const response = await api.get(`/crops/${id}`);
        return response.data;
    },

    getRecommendations: async (inputData) => {
        const response = await api.post('/crops/recommend', inputData);
        return response.data;
    },

    getRecommendationHistory: async () => {
        const response = await api.get('/crops/recommendations/history');
        return response.data;
    },
};

export const diseaseService = {
    detectDisease: async (formData) => {
        const response = await api.post('/diseases/detect', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getDetectionHistory: async () => {
        const response = await api.get('/diseases/history');
        return response.data;
    },

    getDiseases: async (params = {}) => {
        const response = await api.get('/diseases', { params });
        return response.data;
    },

    getDiseaseById: async (id) => {
        const response = await api.get(`/diseases/${id}`);
        return response.data;
    },

    submitFeedback: async (id, feedback) => {
        const response = await api.post(`/diseases/feedback/${id}`, feedback);
        return response.data;
    },
};

export const marketService = {
    getTodayPrices: async (state = 'Kerala') => {
        const response = await api.get('/market/today', { params: { state } });
        return response.data;
    },

    getPriceHistory: async (commodity, days = 30) => {
        const response = await api.get(`/market/history/${commodity}`, { params: { days } });
        return response.data;
    },

    getBestMarket: async (commodity) => {
        const response = await api.get(`/market/best/${commodity}`);
        return response.data;
    },

    getPriceAlerts: async () => {
        const response = await api.get('/market/alerts');
        return response.data;
    },

    refreshPrices: async () => {
        const response = await api.post('/market/refresh');
        return response.data;
    },
};

export const irrigationService = {
    getSensorData: async () => {
        const response = await api.get('/irrigation/sensors');
        return response.data;
    },

    getSensorHistory: async (type = 'soil_moisture', hours = 24) => {
        const response = await api.get('/irrigation/sensors/history', { params: { type, hours } });
        return response.data;
    },

    getSchedules: async () => {
        const response = await api.get('/irrigation/schedules');
        return response.data;
    },

    createSchedule: async (scheduleData) => {
        const response = await api.post('/irrigation/schedules', scheduleData);
        return response.data;
    },

    updateSchedule: async (id, scheduleData) => {
        const response = await api.put(`/irrigation/schedules/${id}`, scheduleData);
        return response.data;
    },

    deleteSchedule: async (id) => {
        const response = await api.delete(`/irrigation/schedules/${id}`);
        return response.data;
    },

    getWaterUsageAnalytics: async (days = 30) => {
        const response = await api.get('/irrigation/analytics', { params: { days } });
        return response.data;
    },

    triggerIrrigation: async (zone, duration) => {
        const response = await api.post('/irrigation/trigger', { zone, duration });
        return response.data;
    },
};

export const equipmentService = {
    getEquipment: async (params = {}) => {
        const response = await api.get('/equipment', { params });
        return response.data;
    },

    getEquipmentById: async (id) => {
        const response = await api.get(`/equipment/${id}`);
        return response.data;
    },

    createEquipment: async (equipmentData) => {
        const response = await api.post('/equipment', equipmentData);
        return response.data;
    },

    bookEquipment: async (id, bookingData) => {
        const response = await api.post(`/equipment/${id}/book`, bookingData);
        return response.data;
    },

    getBookingHistory: async () => {
        const response = await api.get('/equipment/bookings');
        return response.data;
    },

    addReview: async (bookingId, review) => {
        const response = await api.post(`/equipment/bookings/${bookingId}/review`, review);
        return response.data;
    },

    // Vehicle registration methods
    registerVehicle: async (formData) => {
        const response = await api.post('/vehicles', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getVehicles: async (params = {}) => {
        const response = await api.get('/vehicles', { params });
        return response.data;
    },
};

export const laborService = {
    getLaborers: async (params = {}) => {
        const response = await api.get('/labor', { params });
        return response.data;
    },

    getLaborerById: async (id) => {
        const response = await api.get(`/labor/${id}`);
        return response.data;
    },

    registerLaborer: async (laborData) => {
        const response = await api.post('/labor/public-register', laborData);
        return response.data;
    },

    registerAsLaborer: async (laborData) => {
        const response = await api.post('/labor/register', laborData);
        return response.data;
    },

    hireLaborer: async (id, hiringData) => {
        const response = await api.post(`/labor/${id}/hire`, hiringData);
        return response.data;
    },

    getHiringHistory: async () => {
        const response = await api.get('/labor/hiring');
        return response.data;
    },
};

export const livestockService = {
    getLivestock: async (params = {}) => {
        const response = await api.get('/livestock', { params });
        return response.data;
    },

    getLivestockById: async (id) => {
        const response = await api.get(`/livestock/${id}`);
        return response.data;
    },

    addLivestock: async (livestockData) => {
        const response = await api.post('/livestock', livestockData);
        return response.data;
    },

    updateLivestock: async (id, livestockData) => {
        const response = await api.put(`/livestock/${id}`, livestockData);
        return response.data;
    },

    deleteLivestock: async (id) => {
        const response = await api.delete(`/livestock/${id}`);
        return response.data;
    },

    addHealthRecord: async (id, recordData) => {
        const response = await api.post(`/livestock/${id}/health`, recordData);
        return response.data;
    },

    addVaccination: async (id, vaccinationData) => {
        const response = await api.post(`/livestock/${id}/vaccination`, vaccinationData);
        return response.data;
    },

    getVaccinationReminders: async () => {
        const response = await api.get('/livestock/vaccinations/reminders');
        return response.data;
    },

    getProductivityStats: async () => {
        const response = await api.get('/livestock/productivity');
        return response.data;
    },
};

export const governmentNewsService = {
    getNews: async (category = null) => {
        const params = category && category !== 'all' ? { category } : {};
        const response = await api.get('/government-news', { params });
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('/government-news/categories');
        return response.data;
    },

    refreshNews: async () => {
        const response = await api.post('/government-news/refresh');
        return response.data;
    },
};

export const seedService = {
    getDistricts: async () => {
        const response = await api.get('/seeds/districts');
        return response.data;
    },

    getSeedsByDistrict: async (districtId) => {
        const response = await api.get('/seeds', { params: { districtId } });
        return response.data;
    },

    getDistrictById: async (id) => {
        const response = await api.get(`/seeds/districts/${id}`);
        return response.data;
    },

    refreshSeeds: async (districtId = null) => {
        const response = await api.post('/seeds/refresh', { districtId });
        return response.data;
    },
};

export const farmSetupService = {
    calculate: async (data) => {
        const response = await api.post('/farm-setup/calculate', data);
        return response.data;
    },

    save: async (data) => {
        const response = await api.post('/farm-setup', data);
        return response.data;
    },

    getHistory: async () => {
        const response = await api.get('/farm-setup/history');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/farm-setup/${id}`);
        return response.data;
    },
};

export const userService = {
    updateProfile: async (profileData) => {
        const response = await api.put('/users/profile', profileData);
        return response.data;
    },

    changePassword: async (passwordData) => {
        const response = await api.put('/users/password', passwordData);
        return response.data;
    },

    deactivateAccount: async () => {
        const response = await api.put('/users/deactivate');
        return response.data;
    },

    deleteAccount: async () => {
        const response = await api.delete('/users/account');
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },
};

export const iotService = {
    // Device management
    getDevices: async () => {
        const response = await api.get('/iot/devices');
        return response.data;
    },

    registerDevice: async (deviceData) => {
        const response = await api.post('/iot/devices', deviceData);
        return response.data;
    },

    updateDevice: async (deviceId, deviceData) => {
        const response = await api.put(`/iot/devices/${deviceId}`, deviceData);
        return response.data;
    },

    deleteDevice: async (deviceId) => {
        const response = await api.delete(`/iot/devices/${deviceId}`);
        return response.data;
    },

    regenerateApiKey: async (deviceId) => {
        const response = await api.post(`/iot/devices/${deviceId}/regenerate-key`);
        return response.data;
    },

    // Real-time sensor data
    getRealtimeSensors: async () => {
        const response = await api.get('/iot/sensors/realtime');
        return response.data;
    },
};

