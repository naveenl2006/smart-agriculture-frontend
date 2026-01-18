import { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { diseaseService } from '../services/services';
import { FiUpload, FiCamera, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import './DiseaseDetection.css';

const DiseaseDetection = () => {
    const { t } = useLanguage();
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setError('');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setError('');
        }
    };

    const handleSubmit = async () => {
        if (!image) return;

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('diseaseImage', image);

            const response = await diseaseService.detectDisease(formData);
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.message || t('disease.detectionFailed') || 'Detection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetUpload = () => {
        setImage(null);
        setPreview(null);
        setResult(null);
        setError('');
    };

    return (
        <div className="disease-detection-page">
            <div className="page-header">
                <h1 className="page-title">🔬 {t('nav.diseaseDetection')}</h1>
                <p className="page-subtitle">{t('disease.subtitle') || 'Upload a plant image to detect diseases using AI'}</p>
            </div>

            <div className="detection-layout">
                {/* Upload Section */}
                <Card title={t('disease.uploadImage') || 'Upload Plant Image'} icon={<FiCamera />}>
                    {!preview ? (
                        <div
                            className="upload-zone"
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                hidden
                            />
                            <FiUpload size={48} className="upload-icon" />
                            <h4>{t('disease.dragDrop') || 'Drag & drop an image here'}</h4>
                            <p>{t('disease.orClick') || 'or click to browse'}</p>
                            <span className="upload-hint">{t('disease.supports') || 'Supports: JPG, PNG, WebP (max 5MB)'}</span>
                        </div>
                    ) : (
                        <div className="preview-container">
                            <img src={preview} alt="Preview" className="image-preview" />
                            <div className="preview-actions">
                                <Button variant="ghost" onClick={resetUpload}>
                                    {t('disease.changeImage') || 'Change Image'}
                                </Button>
                                <Button onClick={handleSubmit} loading={loading}>
                                    {t('disease.analyzeImage') || 'Analyze Image'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="detection-error">
                            <FiAlertTriangle />
                            <span>{error}</span>
                        </div>
                    )}
                </Card>

                {/* Results Section */}
                <div className="results-section">
                    {result ? (
                        <Card className="result-card">
                            <div className={`result-header ${result.prediction?.isHealthy ? 'healthy' : 'diseased'}`}>
                                {result.prediction?.isHealthy ? (
                                    <>
                                        <FiCheckCircle size={32} />
                                        <h3>{t('disease.plantHealthy') || 'Plant is Healthy!'} ✨</h3>
                                    </>
                                ) : (
                                    <>
                                        <FiAlertTriangle size={32} />
                                        <h3>{t('disease.diseaseDetected') || 'Disease Detected'}</h3>
                                    </>
                                )}
                            </div>

                            <div className="disease-info">
                                <div className="disease-name">
                                    <h4>{result.prediction?.diseaseName}</h4>
                                    <span className="confidence">
                                        {result.prediction?.confidence?.toFixed(1)}% {t('disease.confidence') || 'confidence'}
                                    </span>
                                </div>

                                {result.prediction?.alternativePredictions?.length > 0 && (
                                    <div className="alternative-predictions">
                                        <h5>{t('disease.otherPossibilities') || 'Other Possibilities'}:</h5>
                                        <ul>
                                            {result.prediction.alternativePredictions.map((alt, index) => (
                                                <li key={index}>
                                                    <span className="alt-disease">{alt.diseaseName}</span>
                                                    <span className="alt-confidence">
                                                        {alt.confidence?.toFixed(1)}%
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <Button variant="secondary" fullWidth onClick={resetUpload} className="mt-4">
                                {t('disease.analyzeAnother') || 'Analyze Another Image'}
                            </Button>
                        </Card>
                    ) : (
                        <div className="empty-results">
                            <div className="empty-icon">📸</div>
                            <h3>{t('disease.noAnalysis') || 'No Analysis Yet'}</h3>
                            <p>{t('disease.uploadPrompt') || 'Upload a plant image and click "Analyze Image" to detect diseases using our AI model.'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiseaseDetection;
