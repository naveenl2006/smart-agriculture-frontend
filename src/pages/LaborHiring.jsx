import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/common/Button';
import { laborService } from '../services/services';
import LaborRegistrationModal from '../components/labor/LaborRegistrationModal';
import { FiPlus, FiNavigation, FiPhone, FiMapPin, FiUser, FiStar, FiFilter, FiX, FiBriefcase } from 'react-icons/fi';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import './LaborHiring.css';

// Tamil Nadu center coordinates and bounds
const TAMIL_NADU_CENTER = [11.1271, 78.6569];
const DEFAULT_ZOOM = 7;

// Distance filter options in km
const DISTANCE_OPTIONS = [10, 20, 30, 40, 50];

// Tamil Nadu geographic bounds (SW corner, NE corner)
const TAMIL_NADU_BOUNDS = [
    [8.0, 76.0],   // Southwest corner
    [13.6, 80.5]   // Northeast corner
];
const MIN_ZOOM = 7;
const MAX_ZOOM = 18;

// Skill type icons
const SKILL_ICONS = {
    Harvesting: '🌾',
    Ploughing: '🚜',
    Sowing: '🌱',
    Weeding: '🌿',
    Spraying: '💧',
    Irrigation: '💦',
    General: '👷',
};

// Create worker marker - Snap Map style
const createWorkerIcon = (worker, isNearby = false) => {
    const emoji = '👨‍🌾';
    const size = isNearby ? 70 : 60;
    const glowColor = isNearby ? 'rgba(16, 185, 129, 0.6)' : 'rgba(16, 185, 129, 0.4)';
    const bgColor = '#10b981';

    const mainSkill = worker.skills?.[0]?.skill || 'General';
    const skillEmoji = SKILL_ICONS[mainSkill] || '👷';

    return L.divIcon({
        className: 'custom-worker-marker',
        html: `
            <div class="snap-marker worker-marker ${isNearby ? 'nearby' : ''}" style="
                width: ${size}px;
                height: ${size}px;
                position: relative;
            ">
                <div class="marker-glow" style="
                    position: absolute;
                    top: -5px;
                    left: -5px;
                    right: -5px;
                    bottom: -5px;
                    background: ${glowColor};
                    border-radius: 50%;
                    filter: blur(8px);
                    animation: ${isNearby ? 'pulseGlow 2s ease-in-out infinite' : 'none'};
                "></div>
                <div class="marker-avatar" style="
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 4px solid white;
                    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                    position: relative;
                    z-index: 2;
                    cursor: pointer;
                    background: linear-gradient(135deg, ${bgColor}, ${bgColor}dd);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                ">
                    ${emoji}
                </div>
                <div class="marker-label" style="
                    position: absolute;
                    bottom: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: white;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: 600;
                    color: ${bgColor};
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    white-space: nowrap;
                    z-index: 3;
                ">
                    ${skillEmoji} ${mainSkill}
                </div>
            </div>
        `,
        iconSize: [size, size + 20],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2 - 10],
    });
};

// Create user location marker
const createUserIcon = () => {
    return L.divIcon({
        className: 'user-location-marker',
        html: `
            <div class="user-marker-snap" style="
                width: 50px;
                height: 50px;
                position: relative;
            ">
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(239, 68, 68, 0.3);
                    border-radius: 50%;
                    animation: userPulse 2s ease-out infinite;
                "></div>
                <div style="
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    border-radius: 50%;
                    border: 4px solid white;
                    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    position: relative;
                    z-index: 2;
                ">👤</div>
                <div style="
                    position: absolute;
                    bottom: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #ef4444;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 9px;
                    font-weight: 600;
                    white-space: nowrap;
                    z-index: 3;
                ">You</div>
            </div>
        `,
        iconSize: [50, 60],
        iconAnchor: [25, 25],
    });
};

// Haversine formula for distance
const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Component to recenter map
const RecenterOnUser = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 10, { duration: 1.5 });
        }
    }, [position, map]);
    return null;
};

const LaborHiring = () => {
    const { t } = useLanguage();
    const [laborers, setLaborers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [showNearbyRadius, setShowNearbyRadius] = useState(true);
    const [nearbyRadius, setNearbyRadius] = useState(20);
    const [skillFilter, setSkillFilter] = useState('');
    const mapRef = useRef(null);

    // Fetch laborers from API
    useEffect(() => {
        fetchLaborers();
    }, []);

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                    setLocationError(null);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setLocationError('Unable to get your location');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 30000,
                }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    const fetchLaborers = async () => {
        try {
            setLoading(true);
            const response = await laborService.getLaborers({ available: true });
            setLaborers(response.data?.laborers || []);
        } catch (error) {
            console.error('Error fetching laborers:', error);
            toast.error('Failed to load workers');
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

    const handleMarkerClick = (worker) => {
        setSelectedWorker(worker);
    };

    const centerOnUserLocation = () => {
        if (userLocation && mapRef.current) {
            mapRef.current.flyTo(userLocation, 12, { duration: 1.5 });
        } else {
            toast.error('Your location is not available');
        }
    };

    const isWorkerNearby = (worker) => {
        if (!userLocation || !worker.location?.latitude || !worker.location?.longitude) return false;
        const distance = getDistanceInKm(
            userLocation[0], userLocation[1],
            worker.location.latitude, worker.location.longitude
        );
        return distance <= nearbyRadius;
    };

    // Filter workers that have valid coordinates
    const workersWithCoords = laborers.filter(w =>
        w.location?.latitude && w.location?.longitude
    );

    // Filter by skill
    const filteredWorkers = skillFilter
        ? workersWithCoords.filter(w => w.skills?.some(s => s.skill === skillFilter))
        : workersWithCoords;

    return (
        <div className="labor-map-page">
            {/* Header */}
            <div className="map-header">
                <div className="header-info">
                    <h1>👨‍🌾 {t('nav.labor') || 'Labor Hiring'}</h1>
                    <p>{t('labor.mapSubtitle') || 'Find skilled agricultural workers near you'}</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    icon={<FiPlus />}
                    className="header-register-btn"
                >
                    Register as Labor
                </Button>
            </div>

            {/* Map Container */}
            <div className="map-wrapper">
                {loading ? (
                    <div className="map-loading">
                        <div className="loading-spinner" />
                        <p>Loading workers...</p>
                    </div>
                ) : (
                    <MapContainer
                        center={TAMIL_NADU_CENTER}
                        zoom={DEFAULT_ZOOM}
                        className="labor-map"
                        ref={mapRef}
                        zoomControl={true}
                        minZoom={MIN_ZOOM}
                        maxZoom={MAX_ZOOM}
                        maxBounds={TAMIL_NADU_BOUNDS}
                        maxBoundsViscosity={1.0}
                    >
                        {/* Satellite imagery tiles */}
                        <TileLayer
                            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                        {/* Reference overlay */}
                        <TileLayer
                            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                        />

                        {/* User Location Marker */}
                        {userLocation && (
                            <>
                                <Marker position={userLocation} icon={createUserIcon()}>
                                    <Popup>
                                        <div className="user-popup">
                                            <strong>📍 Your Location</strong>
                                            <p>Lat: {userLocation[0].toFixed(4)}</p>
                                            <p>Lng: {userLocation[1].toFixed(4)}</p>
                                        </div>
                                    </Popup>
                                </Marker>

                                {/* Nearby radius circle */}
                                {showNearbyRadius && (
                                    <Circle
                                        center={userLocation}
                                        radius={nearbyRadius * 1000}
                                        pathOptions={{
                                            color: '#8b5cf6',
                                            fillColor: '#8b5cf633',
                                            fillOpacity: 0.2,
                                            weight: 2,
                                            dashArray: '5, 10',
                                        }}
                                    />
                                )}
                            </>
                        )}

                        {/* Worker Markers */}
                        {filteredWorkers.map((worker) => {
                            const nearby = isWorkerNearby(worker);
                            return (
                                <Marker
                                    key={worker._id}
                                    position={[worker.location.latitude, worker.location.longitude]}
                                    icon={createWorkerIcon(worker, nearby)}
                                    eventHandlers={{
                                        click: () => handleMarkerClick(worker),
                                    }}
                                >
                                    <Popup>
                                        <div className="worker-popup">
                                            <div className="popup-header">
                                                <div className="popup-avatar">👨‍🌾</div>
                                                <div className="popup-name">
                                                    <h4>{worker.name}</h4>
                                                    {worker.isVerified && <span className="verified-badge">✓ Verified</span>}
                                                </div>
                                            </div>
                                            <div className="popup-skills">
                                                {worker.skills?.slice(0, 3).map((s, i) => (
                                                    <span key={i} className={`skill-tag ${s.level?.toLowerCase()}`}>
                                                        {SKILL_ICONS[s.skill] || '👷'} {s.skill}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="popup-stats">
                                                <div className="stat">
                                                    <span className="value">₹{worker.wages?.daily || 0}</span>
                                                    <span className="label">/day</span>
                                                </div>
                                                <div className="stat">
                                                    <FiStar /> {worker.rating?.average || 0}
                                                </div>
                                                <div className="stat">
                                                    <FiBriefcase /> {worker.completedJobs || 0} jobs
                                                </div>
                                            </div>
                                            <p className="popup-location"><FiMapPin size={12} /> {worker.location?.district}</p>
                                            <a href={`tel:${worker.phone}`} className="popup-btn">
                                                <FiPhone /> Call Now
                                            </a>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                )}

                {/* Floating Action Buttons */}
                <div className="map-fab-container">
                    <button
                        className="fab-btn primary"
                        onClick={() => setIsModalOpen(true)}
                        title="Register as labor"
                    >
                        <FiPlus size={24} />
                    </button>

                    <button
                        className="fab-btn secondary"
                        onClick={centerOnUserLocation}
                        title="Center on my location"
                        disabled={!userLocation}
                    >
                        <FiNavigation size={20} />
                    </button>

                    <button
                        className={`fab-btn toggle ${showNearbyRadius ? 'active' : ''}`}
                        onClick={() => setShowNearbyRadius(!showNearbyRadius)}
                        title="Toggle nearby radius"
                    >
                        <FiMapPin size={20} />
                    </button>
                </div>

                {/* Distance Filter Dropdown */}
                <div className="distance-filter-container">
                    <div className="filter-label">
                        <FiFilter size={16} />
                        <span>Filter by Distance</span>
                    </div>
                    <div className="filter-options">
                        {DISTANCE_OPTIONS.map((distance) => (
                            <button
                                key={distance}
                                className={`filter-btn ${nearbyRadius === distance ? 'active' : ''}`}
                                onClick={() => setNearbyRadius(distance)}
                            >
                                {distance} km
                            </button>
                        ))}
                    </div>
                </div>

                {/* Skill Filter */}
                <div className="skill-filter-container">
                    <div className="filter-label">
                        <FiUser size={16} />
                        <span>Filter by Skill</span>
                    </div>
                    <div className="skill-filter-options">
                        <button
                            className={`skill-filter-btn ${!skillFilter ? 'active' : ''}`}
                            onClick={() => setSkillFilter('')}
                        >
                            All
                        </button>
                        {Object.keys(SKILL_ICONS).map((skill) => (
                            <button
                                key={skill}
                                className={`skill-filter-btn ${skillFilter === skill ? 'active' : ''}`}
                                onClick={() => setSkillFilter(skill)}
                            >
                                {SKILL_ICONS[skill]} {skill}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="map-stats-bar">
                    <div className="stat-item">
                        <span className="stat-value">{filteredWorkers.length}</span>
                        <span className="stat-label">Workers</span>
                    </div>
                    {userLocation && (
                        <div className="stat-item nearby">
                            <span className="stat-value">
                                {filteredWorkers.filter(w => isWorkerNearby(w)).length}
                            </span>
                            <span className="stat-label">Nearby ({nearbyRadius}km)</span>
                        </div>
                    )}
                    {locationError && (
                        <div className="stat-item error">
                            <span className="stat-label">{locationError}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Registration Modal */}
            <LaborRegistrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleRegisterLaborer}
            />
        </div>
    );
};

export default LaborHiring;
