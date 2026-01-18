import api from './api';

// OpenWeatherMap API - Free tier allows city name lookup
const OPENWEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || ''; // Add your API key in .env

// District coordinates for Tamil Nadu (for backup geocoding)
const DISTRICT_COORDINATES = {
    'Ariyalur': { lat: 11.1382, lon: 79.0782 },
    'Chengalpattu': { lat: 12.6819, lon: 79.9888 },
    'Chennai': { lat: 13.0827, lon: 80.2707 },
    'Coimbatore': { lat: 11.0168, lon: 76.9558 },
    'Cuddalore': { lat: 11.7480, lon: 79.7714 },
    'Dharmapuri': { lat: 12.1357, lon: 78.1602 },
    'Dindigul': { lat: 10.3624, lon: 77.9695 },
    'Erode': { lat: 11.3410, lon: 77.7172 },
    'Kallakurichi': { lat: 11.7376, lon: 78.9597 },
    'Kancheepuram': { lat: 12.8342, lon: 79.7036 },
    'Karur': { lat: 10.9601, lon: 78.0766 },
    'Krishnagiri': { lat: 12.5186, lon: 78.2137 },
    'Madurai': { lat: 9.9252, lon: 78.1198 },
    'Mayiladuthurai': { lat: 11.1018, lon: 79.6521 },
    'Nagapattinam': { lat: 10.7672, lon: 79.8420 },
    'Namakkal': { lat: 11.2189, lon: 78.1674 },
    'Nilgiris': { lat: 11.4916, lon: 76.7337 },
    'Perambalur': { lat: 11.2320, lon: 78.8806 },
    'Pudukkottai': { lat: 10.3833, lon: 78.8001 },
    'Ramanathapuram': { lat: 9.3639, lon: 78.8395 },
    'Ranipet': { lat: 12.9224, lon: 79.3326 },
    'Salem': { lat: 11.6643, lon: 78.1460 },
    'Sivaganga': { lat: 9.8433, lon: 78.4809 },
    'Tenkasi': { lat: 8.9604, lon: 77.3152 },
    'Thanjavur': { lat: 10.7870, lon: 79.1378 },
    'Theni': { lat: 10.0104, lon: 77.4768 },
    'Thoothukudi': { lat: 8.7642, lon: 78.1348 },
    'Tiruchirappalli': { lat: 10.7905, lon: 78.7047 },
    'Tirunelveli': { lat: 8.7139, lon: 77.7567 },
    'Tirupathur': { lat: 12.4946, lon: 78.5730 },
    'Tiruppur': { lat: 11.1085, lon: 77.3411 },
    'Tiruvallur': { lat: 13.1231, lon: 79.9024 },
    'Tiruvannamalai': { lat: 12.2253, lon: 79.0747 },
    'Tiruvarur': { lat: 10.7668, lon: 79.6345 },
    'Vellore': { lat: 12.9165, lon: 79.1325 },
    'Viluppuram': { lat: 11.9395, lon: 79.4924 },
    'Virudhunagar': { lat: 9.5850, lon: 77.9624 }
};

// Get weather icon based on condition
export const getWeatherIcon = (condition, isDay = true) => {
    const icons = {
        'Clear': isDay ? '☀️' : '🌙',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Fog': '🌫️',
        'Haze': '🌫️',
        'Smoke': '💨',
        'Dust': '💨',
    };
    return icons[condition] || '🌤️';
};

// Fetch weather by district name (uses coordinates)
export const fetchWeatherByDistrict = async (district) => {
    const coords = DISTRICT_COORDINATES[district];

    if (!coords) {
        console.warn(`Coordinates not found for district: ${district}`);
        return null;
    }

    try {
        // Use Open-Meteo API (free, no API key required)
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&timezone=Asia/Kolkata`
        );

        if (!response.ok) {
            throw new Error('Weather API request failed');
        }

        const data = await response.json();

        // Map weather codes to conditions
        const weatherCodeMap = {
            0: 'Clear',
            1: 'Clear', 2: 'Clouds', 3: 'Clouds',
            45: 'Fog', 48: 'Fog',
            51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle',
            61: 'Rain', 63: 'Rain', 65: 'Rain',
            71: 'Snow', 73: 'Snow', 75: 'Snow',
            80: 'Rain', 81: 'Rain', 82: 'Rain',
            95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm'
        };

        const currentWeather = data.current_weather;
        const condition = weatherCodeMap[currentWeather.weathercode] || 'Clear';
        const isDay = currentWeather.is_day === 1;

        return {
            temperature: Math.round(currentWeather.temperature),
            condition: condition,
            icon: getWeatherIcon(condition, isDay),
            windSpeed: currentWeather.windspeed,
            location: district
        };
    } catch (error) {
        console.error('Error fetching weather:', error);
        return null;
    }
};

export default {
    fetchWeatherByDistrict,
    getWeatherIcon
};
