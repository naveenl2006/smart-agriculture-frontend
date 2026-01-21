import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/common/Button';
import { equipmentService } from '../services/services';
import VehicleRegistrationModal from '../components/equipment-rental/VehicleRegistrationModal';
import { FiPlus, FiNavigation, FiPhone, FiMapPin, FiClock, FiDollarSign, FiInfo, FiX, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import './EquipmentRental.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

// Tamil Nadu center coordinates and bounds
const TAMIL_NADU_CENTER = [11.1271, 78.6569];
const DEFAULT_ZOOM = 7;

// Distance filter options in km
const DISTANCE_OPTIONS = [10, 20, 30, 40, 50];

// Tamil Nadu geographic bounds (SW corner, NE corner)
const TAMIL_NADU_BOUNDS = [
    [8.0, 76.0],   // Southwest corner (Kanyakumari area)
    [13.6, 80.5]   // Northeast corner (Chennai area)
];
const MIN_ZOOM = 7;
const MAX_ZOOM = 18;

// Vehicle type icons with emojis
const VEHICLE_ICONS = {
    tractor: '🚜',
    harvester: '🌾',
    rotavator: '⚙️',
    sprayer: '💧',
    earth_mover: '🚧',
    car: '🚗',
    bike: '🏍️',
    equipment: '🔧',
};

// Custom marker icons - Snap Map style with large vehicle avatars
const createVehicleIcon = (type, isNearby = false, vehicleImage = null) => {
    const emoji = VEHICLE_ICONS[type] || '🚜';
    const size = isNearby ? 70 : 60;
    const glowColor = isNearby ? 'rgba(16, 185, 129, 0.6)' : 'rgba(59, 130, 246, 0.4)';

    // If vehicle has an image, show it as avatar, otherwise show large emoji
    const avatarContent = vehicleImage
        ? `<img src="${API_BASE_URL}${vehicleImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 32px;">${emoji}</div>`
        : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 32px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%;">${emoji}</div>`;

    return L.divIcon({
        className: 'custom-vehicle-marker',
        html: `
            <div class="snap-marker ${isNearby ? 'nearby' : ''}" style="
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
                    background: #f0fdf4;
                ">
                    ${avatarContent}
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
                    color: #10b981;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    white-space: nowrap;
                    z-index: 3;
                ">
                    ${emoji} ${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                </div>
            </div>
        `,
        iconSize: [size, size + 20],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2 - 10],
    });
};

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

// Haversine formula to calculate distance between two points
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

// Component to re-center map on user location
const RecenterOnUser = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 12, { duration: 1.5 });
        }
    }, [position, map]);
    return null;
};

// Selected vehicle details panel
const VehicleDetailsPanel = ({ vehicle, onClose, onViewDetails, userLocation }) => {
    if (!vehicle) return null;

    const distance = userLocation
        ? getDistanceInKm(userLocation[0], userLocation[1], vehicle.latitude, vehicle.longitude).toFixed(1)
        : null;

    return (
        <div className="vehicle-details-panel">
            <button className="panel-close-btn" onClick={onClose}>
                <FiX size={20} />
            </button>

            <div className="panel-image">
                <img
                    src={`${API_BASE_URL}${vehicle.imagePath}`}
                    alt={vehicle.name || vehicle.vehicleType}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=Vehicle';
                    }}
                />
                {distance && (
                    <span className="distance-badge">
                        <FiNavigation size={12} />
                        {distance} km away
                    </span>
                )}
            </div>

            <div className="panel-content">
                <h3 className="panel-title">
                    {VEHICLE_ICONS[vehicle.vehicleType]} {vehicle.name || `${vehicle.ownerName}'s ${vehicle.vehicleType}`}
                </h3>

                <div className="panel-info">
                    <div className="info-item">
                        <FiMapPin size={16} />
                        <span>{vehicle.location}</span>
                    </div>
                    <div className="info-item">
                        <FiDollarSign size={16} />
                        <span>₹{vehicle.pricePerDay || vehicle.perHourRent * 8}/day</span>
                    </div>
                    <div className="info-item">
                        <FiClock size={16} />
                        <span>₹{vehicle.perHourRent}/hour</span>
                    </div>
                    <div className="info-item">
                        <FiPhone size={16} />
                        <a href={`tel:${vehicle.phoneNumber}`}>{vehicle.phoneNumber}</a>
                    </div>
                </div>

                <div className={`availability-status ${vehicle.availabilityStatus !== false ? 'available' : 'unavailable'}`}>
                    {vehicle.availabilityStatus !== false ? '✓ Available for Rent' : '✗ Currently Unavailable'}
                </div>

                <Button
                    fullWidth
                    onClick={() => onViewDetails(vehicle._id)}
                    icon={<FiInfo />}
                >
                    View Full Details
                </Button>
            </div>
        </div>
    );
};

const EquipmentRental = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showNearbyRadius, setShowNearbyRadius] = useState(true);
    const [nearbyRadius, setNearbyRadius] = useState(20); // Default 20km
    const mapRef = useRef(null);

    // Fetch vehicles from API
    useEffect(() => {
        fetchVehicles();
    }, []);

    // Get user's live location
    useEffect(() => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                    setLocationError(null);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setLocationError(error.message);
                    toast.error('Unable to get your location. Please enable location services.');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 30000,
                }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            setLocationError('Geolocation is not supported by your browser');
        }
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const response = await equipmentService.getVehicles();
            setVehicles(response.data || []);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            toast.error('Failed to load vehicles');
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterVehicle = async (formData) => {
        const response = await equipmentService.registerVehicle(formData);
        toast.success(t('equipment.registerSuccess') || 'Vehicle registered successfully!');
        fetchVehicles();
        return response;
    };

    const handleMarkerClick = (vehicle) => {
        setSelectedVehicle(vehicle);
    };

    const handleViewDetails = (vehicleId) => {
        navigate(`/equipment/rental/${vehicleId}`);
    };

    const centerOnUserLocation = () => {
        if (userLocation && mapRef.current) {
            mapRef.current.flyTo(userLocation, 12, { duration: 1.5 });
        } else {
            toast.error('Your location is not available yet');
        }
    };

    const isVehicleNearby = (vehicle) => {
        if (!userLocation) return false;
        const distance = getDistanceInKm(
            userLocation[0], userLocation[1],
            vehicle.latitude, vehicle.longitude
        );
        return distance <= nearbyRadius;
    };

    // Filter vehicles that have valid coordinates
    const vehiclesWithCoords = vehicles.filter(v => v.latitude && v.longitude);

    return (
        <div className="equipment-rental-map-page">
            {/* Header */}
            <div className="map-header">
                <div className="header-info">
                    <h1>🚜 {t('nav.equipment') || 'Equipment Rental'}</h1>
                    <p>{t('equipment.mapSubtitle') || 'Find rental vehicles near you on the map'}</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    icon={<FiPlus />}
                    className="header-register-btn"
                >
                    Register Vehicle
                </Button>
            </div>

            {/* Map Container */}
            <div className="map-wrapper">
                {loading ? (
                    <div className="map-loading">
                        <div className="loading-spinner" />
                        <p>Loading map...</p>
                    </div>
                ) : (
                    <MapContainer
                        center={TAMIL_NADU_CENTER}
                        zoom={DEFAULT_ZOOM}
                        className="rental-map"
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
                        {/* Reference overlay with boundaries and labels */}
                        <TileLayer
                            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                        />

                        {/* User Location Marker with Pulse */}
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
                                            color: '#10b981',
                                            fillColor: '#10b98133',
                                            fillOpacity: 0.2,
                                            weight: 2,
                                            dashArray: '5, 10',
                                        }}
                                    />
                                )}
                            </>
                        )}

                        {/* Vehicle Markers */}
                        {vehiclesWithCoords.map((vehicle) => {
                            const nearby = isVehicleNearby(vehicle);
                            return (
                                <Marker
                                    key={vehicle._id}
                                    position={[vehicle.latitude, vehicle.longitude]}
                                    icon={createVehicleIcon(vehicle.vehicleType, nearby, vehicle.imagePath)}
                                    eventHandlers={{
                                        click: () => handleMarkerClick(vehicle),
                                    }}
                                >
                                    <Popup>
                                        <div className="vehicle-popup">
                                            <img
                                                src={`${API_BASE_URL}${vehicle.imagePath}`}
                                                alt={vehicle.vehicleType}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                            <h4>{VEHICLE_ICONS[vehicle.vehicleType]} {vehicle.name || vehicle.vehicleType}</h4>
                                            <p className="popup-price">₹{vehicle.pricePerDay || vehicle.perHourRent * 8}/day</p>
                                            <p className="popup-location"><FiMapPin size={12} /> {vehicle.location}</p>
                                            <button
                                                className="popup-btn"
                                                onClick={() => handleViewDetails(vehicle._id)}
                                            >
                                                View Details
                                            </button>
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
                        title="Register your vehicle"
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

                {/* Stats Bar */}
                <div className="map-stats-bar">
                    <div className="stat-item">
                        <span className="stat-value">{vehiclesWithCoords.length}</span>
                        <span className="stat-label">Vehicles</span>
                    </div>
                    {userLocation && (
                        <div className="stat-item nearby">
                            <span className="stat-value">
                                {vehiclesWithCoords.filter(v => isVehicleNearby(v)).length}
                            </span>
                            <span className="stat-label">Nearby ({nearbyRadius}km)</span>
                        </div>
                    )}
                    {locationError && (
                        <div className="stat-item error">
                            <span className="stat-label">⚠️ Location unavailable</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Vehicle Details Panel */}
            <VehicleDetailsPanel
                vehicle={selectedVehicle}
                onClose={() => setSelectedVehicle(null)}
                onViewDetails={handleViewDetails}
                userLocation={userLocation}
            />

            {/* Vehicle Registration Modal */}
            <VehicleRegistrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleRegisterVehicle}
            />
        </div>
    );
};

export default EquipmentRental;
