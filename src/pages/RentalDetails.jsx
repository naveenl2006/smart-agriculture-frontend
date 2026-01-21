import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { equipmentService } from '../services/services';
import { FiArrowLeft, FiMapPin, FiPhone, FiUser, FiDollarSign, FiClock, FiHash, FiNavigation, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import './RentalDetails.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

// Vehicle type icons
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

// Create marker icon
const createMarkerIcon = () => {
    return L.divIcon({
        className: 'rental-detail-marker',
        html: `
            <div style="
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                border: 3px solid white;
            ">
                📍
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });
};

const RentalDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchVehicleDetails();
    }, [id]);

    const fetchVehicleDetails = async () => {
        try {
            setLoading(true);
            const response = await equipmentService.getVehicleById(id);
            setVehicle(response.data);
        } catch (err) {
            console.error('Error fetching vehicle:', err);
            setError('Vehicle not found');
            toast.error('Failed to load vehicle details');
        } finally {
            setLoading(false);
        }
    };

    const handleCall = () => {
        if (vehicle?.phoneNumber) {
            window.location.href = `tel:${vehicle.phoneNumber}`;
        }
    };

    const handleGetDirections = () => {
        if (vehicle?.latitude && vehicle?.longitude) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${vehicle.latitude},${vehicle.longitude}`,
                '_blank'
            );
        }
    };

    if (loading) {
        return (
            <div className="rental-details-page loading">
                <div className="loading-spinner" />
                <p>Loading vehicle details...</p>
            </div>
        );
    }

    if (error || !vehicle) {
        return (
            <div className="rental-details-page error">
                <h2>😕 Vehicle Not Found</h2>
                <p>The vehicle you're looking for doesn't exist or has been removed.</p>
                <Button onClick={() => navigate('/equipment')}>
                    <FiArrowLeft /> Back to Equipment
                </Button>
            </div>
        );
    }

    const icon = VEHICLE_ICONS[vehicle.vehicleType] || '🚜';

    return (
        <div className="rental-details-page">
            {/* Header */}
            <div className="details-header">
                <button className="back-btn" onClick={() => navigate('/equipment')}>
                    <FiArrowLeft size={20} />
                </button>
                <h1>{icon} {vehicle.name || `${vehicle.ownerName}'s ${vehicle.vehicleType}`}</h1>
            </div>

            <div className="details-content">
                {/* Main Image */}
                <div className="details-image">
                    <img
                        src={`${API_BASE_URL}${vehicle.imagePath}`}
                        alt={vehicle.name || vehicle.vehicleType}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/600x400?text=Vehicle+Image';
                        }}
                    />
                    <div className={`availability-badge ${vehicle.availabilityStatus !== false ? 'available' : 'unavailable'}`}>
                        {vehicle.availabilityStatus !== false ? (
                            <><FiCheckCircle /> Available</>
                        ) : (
                            <><FiXCircle /> Unavailable</>
                        )}
                    </div>
                </div>

                {/* Info Cards */}
                <div className="info-grid">
                    {/* Pricing Card */}
                    <Card className="info-card pricing-card">
                        <h3><FiDollarSign /> Pricing</h3>
                        <div className="price-row">
                            <div className="price-item">
                                <span className="price-value">₹{vehicle.pricePerDay || vehicle.perHourRent * 8}</span>
                                <span className="price-label">per day</span>
                            </div>
                            <div className="price-divider" />
                            <div className="price-item">
                                <span className="price-value">₹{vehicle.perHourRent}</span>
                                <span className="price-label">per hour</span>
                            </div>
                        </div>
                    </Card>

                    {/* Owner Card */}
                    <Card className="info-card owner-card">
                        <h3><FiUser /> Owner Details</h3>
                        <div className="owner-info">
                            <p className="owner-name">{vehicle.ownerName}</p>
                            <a href={`tel:${vehicle.phoneNumber}`} className="owner-phone">
                                <FiPhone /> {vehicle.phoneNumber}
                            </a>
                        </div>
                    </Card>

                    {/* Vehicle Info Card */}
                    <Card className="info-card vehicle-info-card">
                        <h3>🚜 Vehicle Info</h3>
                        <div className="vehicle-details-list">
                            <div className="detail-item">
                                <span className="detail-label">Type</span>
                                <span className="detail-value">{icon} {vehicle.vehicleType}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Number</span>
                                <span className="detail-value vehicle-number">
                                    <FiHash size={14} /> {vehicle.vehicleNumber}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Location Card */}
                    <Card className="info-card location-card">
                        <h3><FiMapPin /> Location</h3>
                        <p className="location-name">{vehicle.location}</p>
                        {vehicle.latitude && vehicle.longitude && (
                            <p className="location-coords">
                                {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}
                            </p>
                        )}
                    </Card>
                </div>

                {/* Mini Map */}
                {vehicle.latitude && vehicle.longitude && (
                    <Card className="map-card">
                        <h3><FiMapPin /> View on Map</h3>
                        <div className="mini-map-container">
                            <MapContainer
                                center={[vehicle.latitude, vehicle.longitude]}
                                zoom={14}
                                className="mini-map"
                                zoomControl={false}
                                scrollWheelZoom={false}
                            >
                                <TileLayer
                                    attribution='&copy; OpenStreetMap'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker
                                    position={[vehicle.latitude, vehicle.longitude]}
                                    icon={createMarkerIcon()}
                                >
                                    <Popup>
                                        <strong>{vehicle.name || vehicle.vehicleType}</strong>
                                        <br />
                                        {vehicle.location}
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="action-buttons">
                    <Button
                        onClick={handleCall}
                        icon={<FiPhone />}
                        fullWidth
                    >
                        Call Owner
                    </Button>
                    {vehicle.latitude && vehicle.longitude && (
                        <Button
                            onClick={handleGetDirections}
                            variant="secondary"
                            icon={<FiNavigation />}
                            fullWidth
                        >
                            Get Directions
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RentalDetails;
