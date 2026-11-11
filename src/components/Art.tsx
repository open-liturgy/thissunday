/** Arch illustration: the altar of incense, smoke, and a disc of light. Inline SVG, no request. */
export function AltarArt({ detail = 'full', label }: { detail?: 'full' | 'small'; label: string }) {
  const small = detail === 'small';
  const sw = (n: number) => (small ? n * 2.5 : n);
  return (
    <svg viewBox="0 0 440 580" role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
      {!small && <circle cx="318" cy="200" r="280" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1" />}
      <circle cx="318" cy="200" r="230" fill="none" stroke="currentColor" strokeWidth={small ? 2 : 1} opacity="0.16" />
      {!small && <circle cx="318" cy="200" r="184" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.24" />}
      <circle cx="318" cy="200" r={small ? 170 : 142} fill="none" stroke="currentColor" strokeWidth={small ? 2 : 1.5} opacity={small ? 0.28 : 0.34} />
      <circle cx="318" cy="200" r={small ? 116 : 104} fill="none" stroke="currentColor" strokeWidth={small ? 3 : 1.5} opacity={small ? 0.45 : 0.48} />
      <circle cx="318" cy="200" r={small ? 72 : 70} fill="none" stroke="currentColor" strokeWidth={small ? 4 : 2} opacity="0.7" />
      <circle cx="318" cy="200" r="40" fill="currentColor" />
      {!small && (
        <g fill="#FFFFFF">
          <circle cx="70" cy="150" r="2" opacity="0.7" />
          <circle cx="112" cy="232" r="1.5" opacity="0.6" />
          <circle cx="58" cy="304" r="1.5" opacity="0.5" />
          <circle cx="384" cy="424" r="2" opacity="0.6" />
          <circle cx="346" cy="352" r="1.5" opacity="0.5" />
        </g>
      )}
      <rect x="0" y="500" width="440" height="80" fill="#000000" opacity="0.3" />
      <rect x="112" y="392" width="116" height="108" fill="currentColor" opacity={small ? 0.2 : 0.18} />
      <rect x="112" y="392" width="116" height="108" fill="none" stroke="currentColor" strokeWidth={small ? 4 : 1.5} />
      <rect x="100" y="376" width="140" height="16" fill="currentColor" />
      <path d="M100 376v-16l14 16z" fill="currentColor" />
      <path d="M240 376v-16l-14 16z" fill="currentColor" />
      {!small && <path d="M150 376a20 9 0 0 1 40 0z" fill="currentColor" />}
      <circle cx="170" cy="363" r={small ? 8 : 5} fill="#E4502E" />
      <g fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeWidth={sw(2)}>
        <path d={small ? 'M170 350C140 314 202 288 170 246S142 182 172 140S204 84 178 42' : 'M170 354C140 316 202 288 170 246S142 182 172 140S204 84 178 42'} opacity="0.9" />
        {small ? (
          <path d="M190 350C222 320 178 292 206 254S238 204 210 162" opacity="0.45" />
        ) : (
          <>
            <path d="M160 356C126 324 170 296 148 258S118 204 146 164S170 120 152 86" opacity="0.55" />
            <path d="M180 356C212 324 168 294 196 256S228 206 200 164S182 122 204 88" opacity="0.4" />
          </>
        )}
      </g>
    </svg>
  );
}

export function ArchLogo({ size = 26, dot = 'currentColor', stroke = 'currentColor', width = 2 }: { size?: number; dot?: string; stroke?: string; width?: number }) {
  return (
    <svg width={size} height={Math.round((size * 32) / 26)} viewBox="0 0 26 32" fill="none" aria-hidden="true">
      <path d="M1 32V13a12 12 0 0 1 24 0v19" stroke={stroke} strokeWidth={width} />
      <circle cx="13" cy="15" r="4" fill={dot} />
    </svg>
  );
}

export const PlayIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
    <path d="M4 2.5v13l11-6.5z" fill="currentColor" />
  </svg>
);

export const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M16 2 8 10M16 2l-5 14-3-6-6-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);
