import './Loader.css';

const Loader = ({ size = 'md', color = 'primary', fullScreen = false }) => {
    if (fullScreen) {
        return (
            <div className="loader-fullscreen">
                <div className="loader-content">
                    <div className={`loader loader-${size} loader-${color}`}>
                        <div className="leaf leaf-1">🌱</div>
                        <div className="leaf leaf-2">🌿</div>
                        <div className="leaf leaf-3">🍃</div>
                    </div>
                    <p className="loader-text">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`loader-spinner loader-${size} loader-${color}`}></div>
    );
};

export default Loader;
