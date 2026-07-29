// CSS Module declarations
declare module '*.css' {
  const styles: Record<string, string>;
  export default styles;
}

declare module '*.module.css' {
  const styles: Record<string, string>;
  export default styles;
}

// SVG as React components (via @svgr/webpack)
declare module '*.svg' {
  import type React from 'react';
  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

// Image files
declare module '*.png' { const src: string; export default src; }
declare module '*.jpg' { const src: string; export default src; }
declare module '*.jpeg'{ const src: string; export default src; }
declare module '*.webp'{ const src: string; export default src; }
declare module '*.avif'{ const src: string; export default src; }
