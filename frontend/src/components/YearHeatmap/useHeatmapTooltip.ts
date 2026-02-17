import { useState, useCallback, useEffect } from 'react';
import type { TooltipContent } from './types';

export function useHeatmapTooltip() {
  const [content, setContent] = useState<TooltipContent | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleHover = useCallback((next: TooltipContent | null, e?: React.MouseEvent) => {
    setContent(next);
    if (e) setPosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    if (!content) return;
    const update = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', update);
    return () => window.removeEventListener('mousemove', update);
  }, [content]);

  const clear = useCallback(() => setContent(null), []);

  return { tooltipContent: content, tooltipPosition: position, handleHover, clear };
}
