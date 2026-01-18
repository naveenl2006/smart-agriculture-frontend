import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/common/Button';
import { FiHome } from 'react-icons/fi';
import './NotFound.css';

const NotFound = () => {
    const { t } = useLanguage();

    return (
        <div className="not-found-page">
            <div className="not-found-content">
                <span className="error-code">404</span>
                <h1>{t('common.pageNotFound') || 'Page Not Found'}</h1>
                <p>{t('common.pageNotFoundDesc') || "Oops! The page you're looking for doesn't exist or has been moved."}</p>
                <Link to="/">
                    <Button size="lg" icon={<FiHome />}>{t('common.backToHome') || 'Back to Home'}</Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
