'use client';

import { useId } from 'react';

/** Uses the original uploaded mark, cropped to the symbol. Its white background
 * is removed at render time so the pale parts of the B remain visible on navy. */
export function BrandMark() {
  const filterId = useId().replace(/:/g, '');
  const source = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/beck-performance-source.png`;

  return (
    <svg viewBox="235 268 328 270" aria-hidden="true" focusable="false">
      <defs>
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    -50 0 0 50 -0.2"
          />
        </filter>
      </defs>
      <image href={source} width="1536" height="663" filter={`url(#${filterId})`} />
    </svg>
  );
}
