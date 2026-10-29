import React, { useState } from 'react';
import { LOGO_IMAGE_PATH } from '../data/initialData';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  brandName?: string;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showWordmark = true,
  brandName = "L'oca del Caire",
  className = '',
  onClick,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const dimensionClasses = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
  }[size];

  const wordmarkSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Thinker with Catalan Barretina Emblem */}
      <div
        className={`relative ${dimensionClasses} shrink-0 rounded-full overflow-hidden border border-[#1C1917]/15 bg-[#F4EFE6] flex items-center justify-center shadow-xs`}
        title="El Pensador amb barretina catalana"
      >
        {!imageFailed ? (
          <img
            src={LOGO_IMAGE_PATH}
            alt="Perfil de l'estàtua del pensador amb barretina catalana"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter contrast-105"
            onError={() => setImageFailed(true)}
          />
        ) : (
          /* Bespoke SVG Fallback: Rodin's Thinker profile wearing Catalan Barretina */
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full p-1"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Soft background */}
            <circle cx="50" cy="50" r="48" fill="#F4EFE6" />

            {/* Red Catalan Barretina with floppy crown and black rim */}
            <path
              d="M36 28 C 42 16, 68 14, 76 25 C 80 32, 77 42, 69 44 C 62 46, 52 38, 48 38 C 43 38, 38 42, 36 44 Z"
              fill="#C02626"
            />
            {/* Barretina fold shadow */}
            <path
              d="M58 20 C 65 20, 75 26, 73 34 C 71 40, 64 42, 59 38 Z"
              fill="#991B1B"
              opacity="0.8"
            />
            {/* Traditional black headband of the barretina */}
            <path
              d="M35 34 C 42 30, 56 31, 64 36 C 62 38, 52 35, 36 38 Z"
              fill="#1C1917"
            />

            {/* The Thinker Profile Silhouette (Forehead, nose, fist to chin, bent elbow, knee) */}
            {/* Head and Face Profile */}
            <path
              d="M38 36 C 44 38, 52 41, 51 45 C 50 49, 44 50, 42 53 C 41 55, 43 57, 44 59 C 41 60, 39 61, 38 64 C 36 67, 33 66, 31 64 C 29 60, 30 55, 32 50 C 33 45, 34 40, 38 36 Z"
              fill="#1C1917"
            />
            {/* Hand and Fist supporting the chin */}
            <path
              d="M44 57 C 47 57, 50 59, 48 63 C 46 66, 42 66, 40 64 Z"
              fill="#1C1917"
            />
            {/* Bent Forearm resting on leg */}
            <path
              d="M43 62 C 48 70, 52 76, 56 80 C 53 82, 48 79, 42 71 C 40 68, 39 64, 43 62 Z"
              fill="#1C1917"
            />
            {/* Muscular back, hunched posture */}
            <path
              d="M31 52 C 24 58, 20 68, 24 82 C 30 84, 38 85, 48 85 C 44 79, 36 76, 33 68 C 30 63, 29 57, 31 52 Z"
              fill="#1C1917"
            />
            {/* Contemplative pedestal base */}
            <path
              d="M18 86 L 82 86 C 80 89, 75 91, 50 91 C 25 91, 20 89, 18 86 Z"
              fill="#1C1917"
            />
          </svg>
        )}
      </div>

      {/* Brand Wordmark */}
      {showWordmark && (
        <span
          className={`font-editorial font-bold tracking-tight text-[#1C1917] ${wordmarkSizeClasses}`}
        >
          {brandName}
        </span>
      )}
    </div>
  );
};
