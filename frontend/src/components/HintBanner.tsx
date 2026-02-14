import React from 'react';

interface HintBannerProps {
  hintText: string | null;
}

export const HintBanner: React.FC<HintBannerProps> = ({ hintText }) => {
  if (!hintText) return null;

  return (
    <div className="mt-2 rounded-lg border border-[#414BEA] bg-[#F6F5F5] px-3 py-2 text-xs text-[#222222]">
      <p className="font-semibold text-[#414BEA]">Hint</p>
      <p className="mt-1">{hintText}</p>
    </div>
  );
};

