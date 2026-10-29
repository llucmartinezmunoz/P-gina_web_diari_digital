import React, { useState, useEffect, useRef } from 'react';
import { Article, CategoryId, SortOption } from '../types';
import { CATEGORIES } from '../data/initialData';
import { Search, X, ArrowRight, MessageSquare, SlidersHorizontal, FileText } from 'lucide-react';
import { formatCardDate } from '../lib/dateUtils';

interface SearchModalProps {
  articles: Article[];
  isOpen: boolean;
  onClose: () => void;
  onSelectArticle: (article: Article) => void;
  initialCategory?: CategoryId | 'totes';
  commentsCountMap: Record<string, number>;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  articles,
  isOpen,
  onClose,
  onSelectArticle,
  initialCategory = 'totes',
  commentsCountMap,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'totes'>(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (initialCategory) setSelectedCategory(initialCategory);
    }
  }, [isOpen, initialCategory]);

  if (!isOpen) return null;

  // Filter and sort articles
  const filtered = articles.filter((art) => {
    // Category match
    if (selectedCategory !== 'totes' && art.category !== selectedCategory) {
      return false;
    }
    // Query text match
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchSubtitle = art.subtitle?.toLowerCase().includes(q);
      const matchContent = art.content?.toLowerCase().includes(q);
      const matchAuthor = art.author.name.toLowerCase().includes(q);
      const matchPdf = art.pdfFileName?.toLowerCase().includes(q);
      return matchTitle || matchSubtitle || matchContent || matchAuthor || matchPdf;
    }
    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'popular') return (b.views || 0) - (a.views || 0);
    if (sortBy === 'comments') {
      const cA = commentsCountMap[a.id] || 0;
      const cB = commentsCountMap[b.id] || 0;
      return cB - cA;
    }
    // 'recent'
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const clearFilters = () => {
    setQuery('');
    setSelectedCategory('totes');
    setSortBy('recent');
  };

  const hasActiveFilters = query.trim() !== '' || selectedCategory !== 'totes' || sortBy !== 'recent';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FBF9F5] border border-[#DDD5C7] rounded-xs shadow-2xl w-full max-w-3xl my-6 flex flex-col overflow-hidden text-[#1C1917]">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E7E2D8] bg-[#F4EFE6] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#78716C] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cercar documents, autors, assajos o temes..."
            className="w-full text-base sm:text-lg bg-transparent border-none focus:outline-none placeholder-[#A8A29E] font-editorial text-[#1C1917]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:text-black text-[#78716C] cursor-pointer"
              title="Netejar cerca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#EAE5DC] rounded-xs text-[#78716C] hover:text-[#1C1917] transition-colors ml-1 cursor-pointer"
            title="Tancar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-[#EAE5DC] bg-[#FAF8F3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Categories Horizontal Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[#A8A29E] uppercase tracking-wider text-[10px] mr-1 shrink-0">
              Secció:
            </span>
            <button
              onClick={() => setSelectedCategory('totes')}
              className={`px-2.5 py-1 rounded-xs transition-colors shrink-0 cursor-pointer ${
                selectedCategory === 'totes'
                  ? 'bg-[#1C1917] text-white font-medium'
                  : 'bg-[#EAE4D7] text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Totes
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-xs transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#9A3412] text-white font-medium'
                    : 'bg-[#EAE4D7] text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort & Reset */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1 text-[11px] text-[#78716C]">
              <SlidersHorizontal className="w-3 h-3 text-[#A8A29E]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-white border border-[#DDD5C7] rounded-xs px-2 py-0.5 text-xs text-[#1C1917] focus:outline-none"
              >
                <option value="recent">Més recents</option>
                <option value="popular">Més llegits</option>
                <option value="comments">Més comentats</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[11px] text-[#9A3412] hover:underline shrink-0 cursor-pointer"
              >
                Restablir
              </button>
            )}
          </div>
        </div>

        {/* Search Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 divide-y divide-[#EAE5DC]">
          <div className="pb-3 text-xs text-[#78716C] flex items-center justify-between font-sans-editorial">
            <span>
              {filtered.length === 1 ? '1 document trobat' : `${filtered.length} documents trobats`}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#78716C]">
              <p className="font-editorial text-lg text-[#44403C]">Cap document no coincideix amb la cerca.</p>
              <p className="text-xs text-[#A8A29E] mt-1">
                Proveu amb altres termes o exploreu les tres seccions principals.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-3 py-1.5 bg-[#1C1917] text-white text-xs rounded-xs hover:bg-[#322D29] cursor-pointer"
              >
                Veure totes les publicacions
              </button>
            </div>
          ) : (
            filtered.map((art) => {
              const catName =
                CATEGORIES.find((c) => c.id === art.category)?.name || art.category;
              const dateStr = formatCardDate(art.publishedAt);

              return (
                <div
                  key={art.id}
                  onClick={() => {
                    onSelectArticle(art);
                    onClose();
                  }}
                  className="py-4 group cursor-pointer hover:bg-[#F5F0E6]/50 px-2 rounded-xs transition-colors flex items-start justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-[#78716C] mb-1">
                      <span className="font-semibold text-[#9A3412] uppercase tracking-wider">
                        {catName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{dateStr}</span>
                      {art.pdfFileName && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1 font-mono text-[10px] text-[#9A3412]">
                            <FileText className="w-3 h-3" />
                            PDF
                          </span>
                        </>
                      )}
                    </div>

                    <h4 className="text-lg font-editorial font-bold text-[#1C1917] group-hover:text-[#9A3412] transition-colors leading-snug mb-1">
                      {art.title}
                    </h4>

                    <p className="text-xs text-[#57534E] line-clamp-2 leading-relaxed mb-2 font-editorial">
                      {art.subtitle}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-[#78716C]">
                      <span>{art.author.name}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-[#A8A29E]" />
                        {commentsCountMap[art.id] || 0} {commentsCountMap[art.id] === 1 ? 'comentari' : 'comentaris'}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#A8A29E] group-hover:text-[#9A3412] shrink-0 mt-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-[#E7E2D8] bg-[#F4EFE6] text-[11px] text-[#78716C] flex items-center justify-between px-6">
          <span>Premeu Esc per tancar</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#1C1917] hover:underline cursor-pointer"
          >
            Tancar
          </button>
        </div>
      </div>
    </div>
  );
};
