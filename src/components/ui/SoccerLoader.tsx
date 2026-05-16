import React from 'react';

interface SoccerLoaderProps {
  size?: number | string;
  className?: string;
  color1?: string; // Default: red (away team)
  color2?: string; // Default: white
  color3?: string; // Default: emerald (home team)
}

/**
 * SoccerLoader - A "Tactically Elevated" loading animation.
 * Features a rolling soccer ball with trailing team colors.
 */
export const SoccerLoader: React.FC<SoccerLoaderProps> = ({
  size = "56px",
  className = "",
  color1 = "hsl(var(--destructive))",
  color2 = "hsl(var(--background))",
  color3 = "hsl(var(--primary))",
}) => {
  return (
    <div className={`soccer-loader-container ${className}`} style={{ width: size, height: size }}>
      <svg
        className="pl"
        viewBox="0 0 56 56"
        width="100%"
        height="100%"
        role="img"
        aria-label="Soccer ball rolling in circles, emitting team colored stripes"
      >
        <clipPath id="ball-clip">
          <circle r="8" />
        </clipPath>
        <defs>
          <path id="hex" d="M 0 -9.196 L 8 -4.577 L 8 4.661 L 0 9.28 L -8 4.661 L -8 -4.577 Z" />
          <g id="hex-chunk" fill="none" stroke="currentColor" strokeWidth="0.5">
            <use href="#hex" fill="currentColor" />
            <use href="#hex" transform="translate(16,0)" />
            <use href="#hex" transform="rotate(60) translate(16,0)" />
          </g>
          <g id="hex-pattern" transform="scale(0.333)">
            <use href="#hex-chunk" />
            <use href="#hex-chunk" transform="rotate(30) translate(0,48) rotate(-30)" />
            <use href="#hex-chunk" transform="rotate(-180) translate(0,27.7) rotate(180)" />
            <use href="#hex-chunk" transform="rotate(-120) translate(0,27.7) rotate(120)" />
            <use href="#hex-chunk" transform="rotate(-60) translate(0,27.7) rotate(60)" />
            <use href="#hex-chunk" transform="translate(0,27.7)" />
            <use href="#hex-chunk" transform="rotate(60) translate(0,27.7) rotate(-60)" />
            <use href="#hex-chunk" transform="rotate(120) translate(0,27.7) rotate(-120)" />
          </g>
          <g id="ball-texture" transform="translate(0,-3.5)">
            <use href="#hex-pattern" transform="translate(-48,0)" />
            <use href="#hex-pattern" transform="translate(-32,0)" />
            <use href="#hex-pattern" transform="translate(-16,0)" />
            <use href="#hex-pattern" transform="translate(0,0)" />
            <use href="#hex-pattern" transform="translate(16,0)" />
          </g>
        </defs>
        <filter id="ball-shadow-inside">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
        <filter id="ball-shadow-outside">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
        
        <g transform="translate(28,28)">
          {/* Stripe Dots - Color 1 (Red/Destructive) */}
          <g className="pl__stripe-dot-group" fill={color1}>
            <circle className="pl__stripe-dot" transform="rotate(32) translate(-18.25,0)" />
            <circle className="pl__stripe-dot" transform="rotate(87) translate(-18.25,0)" />
            <circle className="pl__stripe-dot" transform="rotate(103) translate(-18.25,0)" />
            <circle className="pl__stripe-dot" transform="rotate(138) translate(-18.25,0)" />
            <circle className="pl__stripe-dot" transform="rotate(228) translate(-18.25,0)" />
            <circle className="pl__stripe-dot" transform="rotate(243) translate(-18.25,0)" />
            <circle className="pl__stripe-dot" transform="rotate(328) translate(-18.25,0)" />
          </g>
          
          {/* Stripe Dots - Color 2 (White/Background) */}
          <g className="pl__stripe-dot-group" fill={color2}>
            <circle className="pl__stripe-dot" transform="rotate(41) translate(-15.75,0)" />
            <circle className="pl__stripe-dot" transform="rotate(77) translate(-15.75,0)" />
            <circle className="pl__stripe-dot" transform="rotate(92) translate(-15.75,0)" />
            <circle className="pl__stripe-dot" transform="rotate(146) translate(-15.75,0)" />
            <circle className="pl__stripe-dot" transform="rotate(175) translate(-15.75,0)" />
            <circle className="pl__stripe-dot" transform="rotate(293) translate(-15.75,0)" />
            <circle className="pl__stripe-dot" transform="rotate(314) translate(-15.75,0)" />
            <circle className="pl__stripe-dot" transform="rotate(340) translate(-15.75,0)" />
          </g>
          
          {/* Stripe Dots - Color 3 (Emerald/Primary) */}
          <g className="pl__stripe-dot-group" fill={color3}>
            <circle className="pl__stripe-dot" transform="rotate(20) translate(-13.25,0)" />
            <circle className="pl__stripe-dot" transform="rotate(55) translate(-13.25,0)" />
            <circle className="pl__stripe-dot" transform="rotate(77) translate(-13.25,0)" />
            <circle className="pl__stripe-dot" transform="rotate(106) translate(-13.25,0)" />
            <circle className="pl__stripe-dot" transform="rotate(128) translate(-13.25,0)" />
            <circle className="pl__stripe-dot" transform="rotate(174) translate(-13.25,0)" />
            <circle className="pl__stripe-dot" transform="rotate(279) translate(-13.25,0)" />
          </g>
          
          <g fill="none" strokeLinecap="round" strokeWidth="2.5" transform="rotate(-90)">
            <g className="pl__stripe-rotate">
              <circle className="pl__stripe pl__stripe--1" r="18.25" stroke={color1} strokeDasharray="114.7 114.7" />
            </g>
            <g className="pl__stripe-rotate">
              <circle className="pl__stripe pl__stripe--2" r="15.75" stroke={color2} strokeDasharray="106.8 106.8" />
            </g>
            <g className="pl__stripe-rotate">
              <circle className="pl__stripe pl__stripe--3" r="13.25" stroke={color3} strokeDasharray="99 99" />
            </g>
          </g>
          
          <g className="pl__ball" transform="translate(0,-15.75)">
            <circle className="pl__ball-shadow" filter="url(#ball-shadow-outside)" fill="hsla(142,10%,10%,0.5)" r="8" cx="1" cy="1" />
            <circle fill="white" r="8" />
            <g clipPath="url(#ball-clip)">
              <use className="pl__ball-texture text-gray-900" href="#ball-texture" />
            </g>
            <circle className="pl__ball-shadow" clipPath="url(#ball-clip)" filter="url(#ball-shadow-inside)" fill="none" stroke="hsla(142,10%,10%,0.3)" strokeWidth="5" r="12" cx="-4" cy="-4" />
          </g>
        </g>
      </svg>

      <style jsx>{`
        .pl {
          --dur: 3s;
          display: block;
          width: 100%;
          height: 100%;
        }
        
        .pl__ball,
        .pl__ball-shadow,
        .pl__ball-texture,
        .pl__stripe,
        .pl__stripe-dot,
        .pl__stripe-rotate {
          animation-duration: var(--dur);
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        
        .pl__ball {
          animation-name: ball;
        }
        
        .pl__ball-shadow {
          animation-name: ball-shadow;
        }
        
        .pl__ball-texture {
          animation-name: ball-texture;
        }
        
        .pl__stripe {
          animation-name: stripe;
        }
        
        .pl__stripe--1 { animation-name: stripe1; }
        .pl__stripe--2 { animation-name: stripe2; }
        .pl__stripe--3 { animation-name: stripe3; }
        
        .pl__stripe-dot {
          animation-name: stripe-dot;
        }
        
        .pl__stripe-dot-group:nth-child(1) .pl__stripe-dot:nth-child(2) { animation-delay: calc(var(--dur) * (28 / 120)); }
        .pl__stripe-dot-group:nth-child(1) .pl__stripe-dot:nth-child(3) { animation-delay: calc(var(--dur) * (36 / 120)); }
        .pl__stripe-dot-group:nth-child(1) .pl__stripe-dot:nth-child(4) { animation-delay: calc(var(--dur) * (54 / 120)); }
        .pl__stripe-dot-group:nth-child(1) .pl__stripe-dot:nth-child(5) { animation-delay: calc(var(--dur) * (82 / 120)); }
        .pl__stripe-dot-group:nth-child(1) .pl__stripe-dot:nth-child(6) { animation-delay: calc(var(--dur) * (85 / 120)); }
        .pl__stripe-dot-group:nth-child(1) .pl__stripe-dot:nth-child(7) { animation-delay: calc(var(--dur) * (101 / 120)); }
        
        .pl__stripe-dot-group:nth-child(2) .pl__stripe-dot:nth-child(1) { animation-delay: calc(var(--dur) * (13 / 120)); }
        .pl__stripe-dot-group:nth-child(2) .pl__stripe-dot:nth-child(2) { animation-delay: calc(var(--dur) * (40 / 120)); }
        .pl__stripe-dot-group:nth-child(2) .pl__stripe-dot:nth-child(3) { animation-delay: calc(var(--dur) * (51 / 120)); }
        .pl__stripe-dot-group:nth-child(2) .pl__stripe-dot:nth-child(4) { animation-delay: calc(var(--dur) * (72 / 120)); }
        .pl__stripe-dot-group:nth-child(2) .pl__stripe-dot:nth-child(5) { animation-delay: calc(var(--dur) * (79 / 120)); }
        .pl__stripe-dot-group:nth-child(2) .pl__stripe-dot:nth-child(6) { animation-delay: calc(var(--dur) * (97 / 120)); }
        .pl__stripe-dot-group:nth-child(2) .pl__stripe-dot:nth-child(7) { animation-delay: calc(var(--dur) * (101 / 120)); }
        .pl__stripe-dot-group:nth-child(2) .pl__stripe-dot:nth-child(8) { animation-delay: calc(var(--dur) * (107 / 120)); }
        
        .pl__stripe-dot-group:nth-child(3) .pl__stripe-dot:nth-child(1) { animation-delay: calc(var(--dur) * (-8 / 120)); }
        .pl__stripe-dot-group:nth-child(3) .pl__stripe-dot:nth-child(2) { animation-delay: calc(var(--dur) * (7 / 120)); }
        .pl__stripe-dot-group:nth-child(3) .pl__stripe-dot:nth-child(3) { animation-delay: calc(var(--dur) * (25 / 120)); }
        .pl__stripe-dot-group:nth-child(3) .pl__stripe-dot:nth-child(4) { animation-delay: calc(var(--dur) * (48 / 120)); }
        .pl__stripe-dot-group:nth-child(3) .pl__stripe-dot:nth-child(5) { animation-delay: calc(var(--dur) * (62 / 120)); }
        .pl__stripe-dot-group:nth-child(3) .pl__stripe-dot:nth-child(6) { animation-delay: calc(var(--dur) * (75 / 120)); }
        .pl__stripe-dot-group:nth-child(3) .pl__stripe-dot:nth-child(7) { animation-delay: calc(var(--dur) * (92 / 120)); }
        
        .pl__stripe-rotate {
          animation-name: stripe-rotate;
        }
        
        @keyframes ball {
          from { transform: rotate(0) translate(0,-15.75px); }
          to { transform: rotate(1turn) translate(0,-15.75px); }
        }
        @keyframes ball-shadow {
          from { transform: rotate(0); }
          to { transform: rotate(-1turn); }
        }
        @keyframes ball-texture {
          from { transform: translate(-16px,0); }
          to { transform: translate(48px,0); }
        }
        @keyframes stripe-dot {
          from { r: 1.25px; }
          16.67%, to { r: 0; }
        }
        @keyframes stripe-rotate {
          from { transform: rotate(0); }
          to { transform: rotate(1turn); }
        }
        @keyframes stripe1 {
          from, to { stroke-dashoffset: -95.7745; }
          50% { stroke-dashoffset: -75.702; animation-timing-function: cubic-bezier(0.65,0,0.35,1); }
        }
        @keyframes stripe2 {
          from, to { stroke-dashoffset: -80.1; }
          50% { stroke-dashoffset: -53.4; animation-timing-function: cubic-bezier(0.65,0,0.35,1); }
        }
        @keyframes stripe3 {
          from, to { stroke-dashoffset: -72.765; }
          50% { stroke-dashoffset: -48.51; animation-timing-function: cubic-bezier(0.65,0,0.35,1); }
        }
      `}</style>
    </div>
  );
};
