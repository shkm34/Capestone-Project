import React from 'react';
import { Link } from 'react-router-dom';

interface MainHeaderProps {
  onSignOut: () => void;
}

/**
 * Shared app header/navigation bar shown above authenticated pages.
 * Contains the primary \"Logic Looper\" branding and navigation links.
 */
export const MainHeader: React.FC<MainHeaderProps> = ({ onSignOut }) => {
  return (
    <header className="w-full max-w-xl mx-auto mb-6">
      <nav className="flex items-center justify-between gap-3 sm:gap-4">
        <Link
          to="/"
          className="text-lg sm:text-xl font-semibold text-[#FFFFFF] hover:text-[#DDF2FD] transition-colors"
        >
          Logic Looper
        </Link>
        <div className="flex items-center gap-3 sm:gap-4 text-sm font-medium">
          <Link
            to="/"
            className="text-[#D9E2FF] hover:text-[#FFFFFF] transition-colors"
          >
            Play
          </Link>
          <Link
            to="/profile"
            className="text-[#D9E2FF] hover:text-[#FFFFFF] transition-colors"
          >
            Profile
          </Link>
          <button
            type="button"
            onClick={onSignOut}
            className="text-[#D9E2FF] hover:text-[#FFFFFF] transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>
    </header>
  );
};

