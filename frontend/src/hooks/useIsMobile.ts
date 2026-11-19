import { useState, useEffect } from 'react';

export function useIsMobile(breakpointPx: number = 1024): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpointPx : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [breakpointPx]);

  return isMobile;
}