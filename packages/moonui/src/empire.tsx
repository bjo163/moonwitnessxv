import type { ReactNode } from 'react'

/**
 * Empire's decorative hero illustration. Its geometry is shared as UI artwork;
 * the host page supplies the surrounding copy and MoonUI supplies the palette.
 */
export function EmpireOrbitArtwork(): ReactNode {
  return (
    <svg className="emp-orbit-svg" viewBox="0 0 520 520" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
      <circle className="emp-orbit-svg__frame" cx="260" cy="260" r="218" />
      <circle className="emp-orbit-svg__ring" cx="260" cy="260" r="184" />
      <circle className="emp-orbit-svg__ring emp-orbit-svg__ring--inner" cx="260" cy="260" r="132" />
      <ellipse className="emp-orbit-svg__path" cx="260" cy="260" rx="216" ry="92" transform="rotate(-34 260 260)" />
      <ellipse className="emp-orbit-svg__path emp-orbit-svg__path--fine" cx="260" cy="260" rx="178" ry="58" transform="rotate(54 260 260)" />
      <path className="emp-orbit-svg__axis" d="M260 12v70m0 356v70M12 260h70m356 0h70" />
      <path className="emp-orbit-svg__portal" d="M190 340v-88a70 70 0 0 1 140 0v88Z" />
      <path className="emp-orbit-svg__portal-inset" d="M222 340v-67a38 38 0 0 1 76 0v67Z" />
      <circle className="emp-orbit-svg__core" cx="260" cy="258" r="14" />
      <path className="emp-orbit-svg__light" d="m260 220 8.5 26.5L295 255l-26.5 8.5L260 290l-8.5-26.5L225 255l26.5-8.5Z" />
      <circle className="emp-orbit-svg__node" cx="92" cy="176" r="4.5" />
      <circle className="emp-orbit-svg__node emp-orbit-svg__node--signal" cx="430" cy="339" r="4.5" />
      <circle className="emp-orbit-svg__node emp-orbit-svg__node--accent" cx="364" cy="70" r="3.5" />
      <circle className="emp-orbit-svg__node" cx="160" cy="446" r="3.5" />
      <path className="emp-orbit-svg__tick" d="M260 27v10m0 446v10M27 260h10m446 0h10" />
    </svg>
  )
}
