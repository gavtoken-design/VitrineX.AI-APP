
import * as React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8 w-auto", showText = true }) => {
  return (
    <div className="flex items-center gap-2.5">
      {/* VitrineX AI Logo Icon */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="VitrineX AI Logo"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgb(var(--color-primary))" />
            <stop offset="1" stopColor="rgb(var(--color-secondary))" />
          </linearGradient>
        </defs>

        {/* Background Shape (Subtle) */}
        <rect width="40" height="40" rx="10" className="fill-primary" fillOpacity="0.08" />

        {/* The 'V' Shape - Stylized for Vitrine */}
        <path
          d="M11 12L18.5 29L26 12"
          stroke="url(#logoGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* The 'X' / AI Spark Element */}
        <path
          d="M26 22L33 15M33 22L26 15"
          stroke="rgb(var(--color-primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-90"
        />
      </svg>

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center tracking-tight">
            <span className="font-bold text-lg text-title">Vitrine</span>
            <span className="font-extrabold text-lg text-primary italic ml-px">X</span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] text-muted font-semibold mt-0.5 ml-0.5">
            AI Automation
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
