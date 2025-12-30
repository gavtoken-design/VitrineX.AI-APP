import React from 'react';

const GlobalFilters: React.FC = () => {
    return (
        <svg className="hidden" aria-hidden="true">
            <defs>
                <filter
                    id="glass-blur"
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    filterUnits="objectBoundingBox"
                >
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.003 0.007"
                        numOctaves="1"
                        result="turbulence"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="turbulence"
                        scale="200"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </defs>
        </svg>
    );
};

export default React.memo(GlobalFilters);
