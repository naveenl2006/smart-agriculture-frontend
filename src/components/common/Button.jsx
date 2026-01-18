import './Button.css';

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    onClick,
    className = '',
    ...props
}) => {
    const buttonClasses = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth && 'btn-full',
        loading && 'btn-loading',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={buttonClasses}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading && <span className="btn-spinner"></span>}
            {icon && iconPosition === 'left' && !loading && (
                <span className="btn-icon">{icon}</span>
            )}
            <span className="btn-text">{children}</span>
            {icon && iconPosition === 'right' && (
                <span className="btn-icon">{icon}</span>
            )}
        </button>
    );
};

export default Button;
