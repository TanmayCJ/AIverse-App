import React from 'react';
import aiLogo from './ai-logo.png';

const Logo = ({
  size = 'medium',
  showText = false,
  className = '',
  onClick,
}) => {
  const sizeConfig = {
    small:  { logoSize: 40,  textSize: '16px', glowBlur: 10 },
    medium: { logoSize: 64,  textSize: '20px', glowBlur: 14 },
    large:  { logoSize: 120, textSize: '32px', glowBlur: 20 },
    xlarge: { logoSize: 160, textSize: '48px', glowBlur: 26 },
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
      {/* Neon glow container (keeps PNG intact) */}
      <div className="relative inline-block" style={{ width: config.logoSize }}>
        {/* Back glow aura */}
        <div
          className="absolute inset-0 -z-10 rounded-xl animate-pulse"
          style={{
            background: 'radial-gradient(circle at 50% 45%, rgba(0, 240, 255, 0.45) 0%, rgba(6, 182, 212, 0.25) 35%, transparent 70%)',
            filter: `blur(${config.glowBlur}px)`,
            opacity: 0.9,
          }}
        />

        {/* Edge neon by drop-shadows on the image */}
        <img
          src={aiLogo}
          alt="AIverse logo"
          draggable="false"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            userSelect: 'none',
            filter: [
              'drop-shadow(0 0 6px rgba(0, 240, 255, 0.65))',
              'drop-shadow(0 0 12px rgba(6, 182, 212, 0.45))',
              'drop-shadow(0 0 18px rgba(59, 130, 246, 0.35))',
            ].join(' '),
          }}
        />
      </div>

      {showText && (
        <span className="font-semibold" style={{ fontSize: config.textSize }}>
          AIverse
        </span>
      )}
    </div>
  );
};

export default Logo;