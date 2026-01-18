import './Card.css';

const Card = ({
    children,
    title,
    subtitle,
    icon,
    variant = 'default',
    padding = 'md',
    hoverable = false,
    className = '',
    headerAction,
    footer,
    onClick,
}) => {
    const cardClasses = [
        'card',
        `card-${variant}`,
        `card-padding-${padding}`,
        hoverable && 'card-hoverable',
        onClick && 'card-clickable',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={cardClasses} onClick={onClick}>
            {(title || icon || headerAction) && (
                <div className="card-header">
                    <div className="card-header-left">
                        {icon && <div className="card-icon">{icon}</div>}
                        <div className="card-titles">
                            {title && <h3 className="card-title">{title}</h3>}
                            {subtitle && <p className="card-subtitle">{subtitle}</p>}
                        </div>
                    </div>
                    {headerAction && <div className="card-header-action">{headerAction}</div>}
                </div>
            )}
            <div className="card-body">{children}</div>
            {footer && <div className="card-footer">{footer}</div>}
        </div>
    );
};

export default Card;
