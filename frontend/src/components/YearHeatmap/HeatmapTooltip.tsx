import React from 'react';
import type { TooltipContent } from './types';

function formatStatus(content: TooltipContent): string {
  if (content.level === 0) return 'No activity';
  const parts: string[] = [`Level ${content.level}`];
  if (typeof content.score === 'number') parts.push(`${content.score} pts`);
  if (content.timeTakenMs != null) {
    parts.push(`${Math.round(content.timeTakenMs / 1000)}s`);
  }
  return parts.join(' · ');
}

interface HeatmapTooltipProps {
  content: TooltipContent;
}

export const HeatmapTooltip: React.FC<HeatmapTooltipProps> = ({ content }) => (
  <div className="pointer-events-none absolute z-50 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-left shadow-xl">
    <p className="text-sm font-semibold text-white">{content.date}</p>
    <p className="text-xs text-slate-300 mt-0.5">{formatStatus(content)}</p>
  </div>
);
