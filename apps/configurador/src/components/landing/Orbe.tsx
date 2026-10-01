'use client';
import o from './Orbe.module.css';

export function Orbe({ active }: { active?: boolean }) {
  return (
    <div className={`${o.orbe} ${active ? o.active : ''}`} aria-hidden="true">
      <svg className={o.svg} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="orbeCore" cx="42%" cy="38%">
            <stop offset="0" stopColor="#2a50e6" />
            <stop offset="55%" stopColor="#101f86" />
            <stop offset="100%" stopColor="#05081f" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="orbeA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#9b7bff" />
            <stop offset="45%" stopColor="#3f6dff" />
            <stop offset="100%" stopColor="#14d7f5" />
          </linearGradient>
          <linearGradient id="orbeB" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#17e0ff" />
            <stop offset="50%" stopColor="#2b4cff" />
            <stop offset="100%" stopColor="#6a3ce0" />
          </linearGradient>
          <linearGradient id="orbeC" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#eef3a8" />
            <stop offset="40%" stopColor="#4fd8e8" />
            <stop offset="100%" stopColor="#2b4cff" />
          </linearGradient>
          <radialGradient id="orbeAmb" cx="50%" cy="50%">
            <stop offset="38%" stopColor="#2a5bff" stopOpacity=".34" />
            <stop offset="100%" stopColor="#2a5bff" stopOpacity="0" />
          </radialGradient>
          <filter id="orbeLiq" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves={2} seed={7} result="n">
              <animate attributeName="baseFrequency" dur="16s" values="0.009;0.015;0.007;0.009" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="n" scale={16} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="orbeB5" x="-35%" y="-35%" width="170%" height="170%"><feGaussianBlur stdDeviation={5} /></filter>
          <filter id="orbeB2" x="-35%" y="-35%" width="170%" height="170%"><feGaussianBlur stdDeviation={1.8} /></filter>
          <radialGradient id="orbeVig">
            <stop offset="40%" stopColor="#fff" stopOpacity="1" />
            <stop offset="72%" stopColor="#fff" stopOpacity=".5" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="orbeSoft"><rect x="0" y="0" width="400" height="400" fill="url(#orbeVig)" /></mask>
        </defs>
        <circle cx="200" cy="200" r="196" fill="url(#orbeAmb)" />
        <g mask="url(#orbeSoft)">
          <g className={o.wob} filter="url(#orbeLiq)">
            <ellipse cx="196" cy="208" rx="134" ry="112" fill="url(#orbeCore)" filter="url(#orbeB5)" transform="rotate(-24 196 208)" />
            <g className={o.s1} style={{ mixBlendMode: 'screen' }}><ellipse cx="200" cy="200" rx="150" ry="116" fill="none" stroke="url(#orbeA)" strokeWidth="30" opacity=".6" filter="url(#orbeB5)" transform="rotate(-16 200 200)" /></g>
            <g className={o.s2} style={{ mixBlendMode: 'screen' }}><ellipse cx="200" cy="200" rx="124" ry="152" fill="none" stroke="url(#orbeB)" strokeWidth="22" opacity=".56" filter="url(#orbeB5)" transform="rotate(32 200 200)" /></g>
            <g className={o.s3} style={{ mixBlendMode: 'screen' }}><ellipse cx="200" cy="200" rx="146" ry="132" fill="none" stroke="url(#orbeA)" strokeWidth="13" opacity=".48" filter="url(#orbeB5)" transform="rotate(74 200 200)" /></g>
            <g className={o.s4} style={{ mixBlendMode: 'screen' }}><ellipse cx="200" cy="200" rx="136" ry="146" fill="none" stroke="url(#orbeC)" strokeWidth="9" opacity=".42" filter="url(#orbeB5)" transform="rotate(-58 200 200)" /></g>
            <g className={o.s1}><ellipse cx="200" cy="200" rx="152" ry="122" fill="none" stroke="#dfe9ff" strokeWidth="1.6" opacity=".7" filter="url(#orbeB2)" transform="rotate(-14 200 200)" /></g>
            <g className={o.s2}><ellipse cx="200" cy="200" rx="128" ry="150" fill="none" stroke="#bcd4ff" strokeWidth="1.2" opacity=".55" filter="url(#orbeB2)" transform="rotate(30 200 200)" /></g>
            <g className={o.s3}><ellipse cx="200" cy="200" rx="106" ry="142" fill="none" stroke="#9fd8ff" strokeWidth="1" opacity=".4" filter="url(#orbeB2)" transform="rotate(66 200 200)" /></g>
            <ellipse cx="132" cy="118" rx="50" ry="25" fill="#ffffff" opacity=".45" filter="url(#orbeB5)" transform="rotate(-36 132 118)" />
            <ellipse cx="292" cy="264" rx="38" ry="14" fill="#eaf3a0" opacity=".3" filter="url(#orbeB5)" transform="rotate(-28 292 264)" />
            <ellipse cx="264" cy="122" rx="24" ry="8" fill="#ffffff" opacity=".5" filter="url(#orbeB2)" transform="rotate(-50 264 122)" />
          </g>
        </g>
      </svg>
    </div>
  );
}
