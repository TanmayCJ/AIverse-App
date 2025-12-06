import React from 'react';
import aiLogo from './ai-logo.png';

const Logo = ({
  size = 'medium',
  showText = false,
  className = '',
  onClick,
}) => {
  const sizeConfig = {
    small:  { logoSize: 40,  textSize: '16px', },
    medium: { logoSize: 64,  textSize: '20px', },
    large:  { logoSize: 120, textSize: '32px',  },
    xlarge: { logoSize: 160, textSize: '48px',},
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  return (
    <div
      className={`flex items-center space-x-3 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label="AIverse logo"
    >
      <img
        src={aiLogo}
        alt="AIverse logo"
        draggable="false"
        style={{
          width: config.logoSize,
          height: config.logoSize,
          display: 'block',
          userSelect: 'none',
          filter: 'grayscale(100%) brightness(1.2) contrast(1.3)',
          mixBlendMode: 'screen',
          opacity: 0.95,
          background: 'transparent',
        }}
      />

      {showText && (
        <span className="font-semibold" style={{ fontSize: config.textSize }}>
          AIverse
        </span>
      )}
    </div>
  );
};

export default Logo;