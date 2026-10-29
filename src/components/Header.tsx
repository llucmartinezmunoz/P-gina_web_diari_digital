import React from 'react';
import { Logo } from './Logo';
import { CategoryId } from '../types';
import { Search, PenLine, ShieldCheck, Bookmark, Lock } from 'lucide-react';
import { formatHeaderDate } from '../lib/dateUtils';

interface HeaderProps {
  activeCategory: CategoryId | 'totes';
  onSelectCategory: (cat: CategoryId | 'totes') => void;
  onOpenSearch: () => void;
  onOpenEditor: () => void;
  onOpenModerator: () => void;
  onOpenBookmarks: () => void;
  onOpenEditorLogin: () => void;
  isEditor: boolean;
  bookmarksCount: number;
  pendingCommentsCount: number;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenEditor,
  onOpenModerator,
  onOpenBookmarks,
  onOpenEditorLogin,
  isEditor,
  bookmarksCount,
  pendingCommentsCount,
  onNavigateHome,
}) => {
  const currentDateFormatted = formatHeaderDate(new Date());

  return (
    <header className="w-full bg-[#FBF9F5] border-b border-[#E7E2D8] sticky top-0 z-40 transition-colors">
      {/* Editorial Top Utility Ribbon - Clean & Minimalist */}
      <div className="border-b border-[#EAE5DC] text-[11px] text-[#78716C] px-4 sm:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2 tracking-wide">
        {/* Date and Location */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="font-medium text-[#44403C] capitalize">{currentDateFormatted}</span>
          <span aria-hidden="true" className="text-[#D6CEBE]">·</span>
          <span>Edició digital</span>
          <span aria-hidden="true" className="hidden sm:inline text-[#D6CEBE]">·</span>
          <span className="hidden sm:inline text-[#57534E]">Barcelona</span>
        </div>

        {/* Right utility items: Bookmarks + Editor Access */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Bookmarks */}
          <button
            onClick={onOpenBookmarks}
            className="flex items-center gap-1.5 hover:text-[#1C1917] transition-colors cursor-pointer"
            title="Articles desats"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#9A3412]" />
            <span className="hidden sm:inline">Desats</span>
            {bookmarksCount > 0 && (
              <span className="font-mono text-[10px] text-[#9A3412] font-semibold tabular-nums">
                ({bookmarksCount})
              </span>
            )}
          </button>

          {isEditor ? (
            <>
              <span aria-hidden="true" className="text-[#D6CEBE]">·</span>
              <button
                onClick={onOpenModerator}
                className="flex items-center gap-1.5 hover:text-[#1C1917] transition-colors font-medium text-[#1C1917] cursor-pointer"
                title="Gestió i moderació (exclusiu redacció)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#9A3412]" />
                <span>Moderació & Gestió</span>
                {pendingCommentsCount > 0 && (
                  <span className="bg-[#9A3412] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold tabular-nums">
                    {pendingCommentsCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            <>
              <span aria-hidden="true" className="text-[#D6CEBE]">·</span>
              <button
                onClick={onOpenEditorLogin}
                className="flex items-center gap-1 text-[#78716C] hover:text-[#1C1917] transition-colors text-[11px] cursor-pointer"
                title="Accés de redacció"
              >
                <Lock className="w-3 h-3 text-[#A8A29E]" />
                <span className="hidden sm:inline">Redacció</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
        {/* Brand Wordmark with Thinker + Barretina Logo */}
        <Logo
          size="md"
          brandName="L'oca del Caire"
          onClick={onNavigateHome}
          className="shrink-0"
        />

        {/* 3 Main Editorial Sections (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]">
          <button
            onClick={() => {
              onNavigateHome();
              onSelectCategory('totes');
            }}
            className={`transition-colors pb-0.5 border-b-2 cursor-pointer ${
              activeCategory === 'totes'
                ? 'border-[#9A3412] text-[#1C1917] font-semibold'
                : 'border-transparent hover:text-[#1C1917] hover:border-[#D6CEBE]'
            }`}
          >
            Portada
          </button>
          <button
            onClick={() => onSelectCategory('escrits-personals')}
            className={`transition-colors pb-0.5 border-b-2 cursor-pointer ${
              activeCategory === 'escrits-personals'
                ? 'border-[#9A3412] text-[#1C1917] font-semibold'
                : 'border-transparent hover:text-[#1C1917] hover:border-[#D6CEBE]'
            }`}
          >
            Escrits personals
          </button>
          <button
            onClick={() => onSelectCategory('opinio')}
            className={`transition-colors pb-0.5 border-b-2 cursor-pointer ${
              activeCategory === 'opinio'
                ? 'border-[#9A3412] text-[#1C1917] font-semibold'
                : 'border-transparent hover:text-[#1C1917] hover:border-[#D6CEBE]'
            }`}
          >
            Articles d'opinió
          </button>
          <button
            onClick={() => onSelectCategory('assajos')}
            className={`transition-colors pb-0.5 border-b-2 cursor-pointer ${
              activeCategory === 'assajos'
                ? 'border-[#9A3412] text-[#1C1917] font-semibold'
                : 'border-transparent hover:text-[#1C1917] hover:border-[#D6CEBE]'
            }`}
          >
            Assajos
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#57534E] hover:text-[#1C1917] bg-[#F3EFE6] hover:bg-[#EAE4D7] border border-[#DDD5C7] rounded-sm transition-colors cursor-pointer"
            title="Cercar documents (⌘K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerca</span>
            <kbd className="hidden md:inline-block font-mono text-[10px] text-[#A8A29E] bg-[#FAF8F5] px-1 rounded border border-[#E7E2D8]">
              ⌘K
            </kbd>
          </button>

          {/* Publishing tab only visible to the editor */}
          {isEditor && (
            <button
              onClick={onOpenEditor}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1C1917] hover:bg-[#322D29] rounded-sm transition-colors tracking-wide shrink-0 shadow-xs cursor-pointer"
              title="Publicar nou document PDF"
            >
              <PenLine className="w-3.5 h-3.5 text-[#E7E2D8]" />
              <span>Publicar</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Rail */}
      <div className="md:hidden border-t border-[#EAE5DC] overflow-x-auto no-scrollbar px-4 py-2 flex items-center gap-4 text-xs font-medium text-[#57534E]">
        <button
          onClick={() => {
            onNavigateHome();
            onSelectCategory('totes');
          }}
          className={`whitespace-nowrap cursor-pointer ${activeCategory === 'totes' ? 'text-[#9A3412] font-bold' : ''}`}
        >
          Portada
        </button>
        <button
          onClick={() => onSelectCategory('escrits-personals')}
          className={`whitespace-nowrap cursor-pointer ${activeCategory === 'escrits-personals' ? 'text-[#9A3412] font-bold' : ''}`}
        >
          Escrits personals
        </button>
        <button
          onClick={() => onSelectCategory('opinio')}
          className={`whitespace-nowrap cursor-pointer ${activeCategory === 'opinio' ? 'text-[#9A3412] font-bold' : ''}`}
        >
          Articles d'opinió
        </button>
        <button
          onClick={() => onSelectCategory('assajos')}
          className={`whitespace-nowrap cursor-pointer ${activeCategory === 'assajos' ? 'text-[#9A3412] font-bold' : ''}`}
        >
          Assajos
        </button>
      </div>
    </header>
  );
};
