import React from 'react';
import { Article } from '../types';
import { CATEGORIES } from '../data/initialData';
import { Bookmark, MessageSquare, ArrowUpRight, FileText, Trash2 } from 'lucide-react';
import { formatCardDate } from '../lib/dateUtils';

interface ArticleCardProps {
  article: Article;
  variant?: 'lead' | 'featured' | 'standard' | 'compact' | 'opinion';
  commentsCount?: number;
  isBookmarked?: boolean;
  onBookmarkToggle?: (e: React.MouseEvent) => void;
  onClick: () => void;
  onCategoryClick?: (catId: string, e: React.MouseEvent) => void;
  isEditor?: boolean;
  onDelete?: (e: React.MouseEvent) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = 'standard',
  commentsCount = 0,
  isBookmarked = false,
  onBookmarkToggle,
  onClick,
  onCategoryClick,
  isEditor = false,
  onDelete,
}) => {
  const categoryName =
    CATEGORIES.find((c) => c.id === article.category)?.name || article.category;

  const formattedDate = formatCardDate(article.publishedAt);

  // --- VARIANT 1: LEAD STORY (Dominant visual anchor on front page) ---
  if (variant === 'lead') {
    return (
      <article
        onClick={onClick}
        className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pb-8 border-b border-[#E7E2D8]"
      >
        <div className="lg:col-span-7 overflow-hidden rounded-xs bg-[#EFE9DF] border border-[#DDD5C7] relative aspect-16/10 lg:aspect-16/9">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#F4EFE6] text-[#78716C]">
              <FileText className="w-12 h-12 text-[#9A3412] mb-2" />
              <span className="font-editorial text-base font-bold text-[#1C1917]">
                Document PDF
              </span>
              <span className="text-xs font-mono">{article.pdfFileName || 'Document'}</span>
            </div>
          )}
          {article.imageCaption && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-[11px] text-white/90 italic font-editorial">
              {article.imageCaption}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            {/* Zero-Pill Unboxed Metadata with Typographic Separators */}
            <div className="flex items-center gap-2 text-xs text-[#78716C] mb-2 font-sans-editorial">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryClick?.(article.category, e);
                }}
                className="font-semibold uppercase tracking-wider text-[#9A3412] hover:underline"
              >
                {categoryName}
              </button>
              <span aria-hidden="true">·</span>
              <span>{formattedDate}</span>
              {article.pdfFileName && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-[#9A3412]">
                    <FileText className="w-3 h-3" />
                    PDF
                  </span>
                </>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-editorial font-bold text-[#1C1917] leading-tight tracking-tight group-hover:text-[#9A3412] transition-colors mb-3 [text-wrap:balance]">
              {article.title}
            </h2>

            <p className="text-sm sm:text-base text-[#57534E] leading-relaxed mb-4 line-clamp-3">
              {article.subtitle}
            </p>
          </div>

          <div className="pt-4 border-t border-[#EAE5DC] flex items-center justify-between text-xs text-[#78716C]">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#E5DFD3] text-[#44403C] flex items-center justify-center font-editorial font-bold text-xs uppercase">
                {article.author.name.charAt(0)}
              </div>
              <span className="font-medium text-[#1C1917]">{article.author.name}</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 hover:text-[#1C1917]">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="tabular-nums font-mono text-[11px]">{commentsCount}</span>
              </span>

              {onBookmarkToggle && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookmarkToggle(e);
                  }}
                  className="p-1 hover:text-[#9A3412] transition-colors cursor-pointer"
                  title={isBookmarked ? 'Eliminar dels desats' : 'Desar per llegir més tard'}
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      isBookmarked ? 'fill-[#9A3412] text-[#9A3412]' : 'text-[#78716C]'
                    }`}
                  />
                </button>
              )}

              {isEditor && onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(e);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xs transition-colors shadow-xs ml-1 cursor-pointer"
                  title="Suprimir aquest document de L'oca del Caire"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Suprimir</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  // --- VARIANT 2: OPINION / TRIBUNA COLUMN ---
  if (variant === 'opinion') {
    return (
      <article
        onClick={onClick}
        className="group cursor-pointer p-4 bg-[#F5F0E6]/60 border border-[#E2DBD0] hover:border-[#D0C7B8] transition-all flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between text-xs text-[#78716C] mb-2 font-sans-editorial">
            <span className="font-semibold uppercase tracking-wider text-[#9A3412]">
              Tribuna d'Opinió
            </span>
            {article.pdfFileName ? (
              <span className="flex items-center gap-1 font-mono text-[11px] text-[#9A3412]">
                <FileText className="w-3 h-3" /> PDF
              </span>
            ) : (
              <span>{article.readTimeMinutes} min</span>
            )}
          </div>

          <h3 className="text-xl font-editorial font-bold text-[#1C1917] group-hover:text-[#9A3412] transition-colors leading-snug mb-2 [text-wrap:balance]">
            {article.title}
          </h3>

          <p className="text-xs text-[#57534E] leading-relaxed line-clamp-3 mb-4 italic font-editorial">
            "{article.subtitle}"
          </p>
        </div>

        <div className="pt-3 border-t border-[#E5DFD3] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#1C1917] text-white flex items-center justify-center font-editorial text-[10px]">
              {article.author.name.charAt(0)}
            </div>
            <span className="font-medium text-[#1C1917] truncate max-w-[140px]">
              {article.author.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#A8A29E] group-hover:text-[#9A3412] flex items-center">
              Llegir document <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
            {isEditor && onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(e);
                }}
                className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xs transition-colors cursor-pointer"
                title="Suprimir aquest document"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
                <span>Suprimir</span>
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  // --- VARIANT 3: COMPACT ROW (List item) ---
  if (variant === 'compact') {
    return (
      <article
        onClick={onClick}
        className="group cursor-pointer py-3.5 border-b border-[#EAE5DC] flex items-baseline justify-between gap-4"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] text-[#78716C] mb-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCategoryClick?.(article.category, e);
              }}
              className="text-[#9A3412] uppercase font-medium hover:underline"
            >
              {categoryName}
            </button>
            <span aria-hidden="true">·</span>
            <span>{formattedDate}</span>
            {article.pdfFileName && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#9A3412] text-[10px]">PDF</span>
              </>
            )}
          </div>
          <h4 className="text-base font-editorial font-semibold text-[#1C1917] group-hover:text-[#9A3412] transition-colors leading-snug truncate">
            {article.title}
          </h4>
        </div>
        <div className="text-xs text-[#78716C] shrink-0 flex items-center gap-2">
          <span className="hidden sm:inline font-sans-editorial text-[11px]">{article.author.name}</span>
          {isEditor && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(e);
              }}
              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
              title="Suprimir aquest document"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <ArrowUpRight className="w-3.5 h-3.5 text-[#A8A29E] group-hover:text-[#9A3412]" />
        </div>
      </article>
    );
  }

  // --- VARIANT 4: STANDARD CARD (Default Grid Item) ---
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer flex flex-col justify-between bg-transparent pb-6 border-b border-[#EAE5DC]"
    >
      <div>
        {article.imageUrl ? (
          <div className="overflow-hidden rounded-xs bg-[#EFE9DF] border border-[#DDD5C7] aspect-16/10 mb-3.5">
            <img
              src={article.imageUrl}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-400"
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-xs bg-[#FAF8F3] border border-[#DDD5C7] aspect-16/10 mb-3.5 flex flex-col items-center justify-center p-4 text-[#78716C]">
            <FileText className="w-8 h-8 text-[#9A3412] mb-1" />
            <span className="text-xs font-mono">{article.pdfFileName || 'Document PDF'}</span>
          </div>
        )}

        {/* Clean unboxed metadata */}
        <div className="flex items-center gap-2 text-xs text-[#78716C] mb-1.5 font-sans-editorial">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCategoryClick?.(article.category, e);
            }}
            className="font-semibold uppercase tracking-wider text-[#9A3412] hover:underline"
          >
            {categoryName}
          </button>
          <span aria-hidden="true">·</span>
          <span>{formattedDate}</span>
          {article.pdfFileName && (
            <>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-0.5 font-mono text-[11px] text-[#9A3412]">
                <FileText className="w-3 h-3" />
                PDF
              </span>
            </>
          )}
        </div>

        <h3 className="text-lg sm:text-xl font-editorial font-bold text-[#1C1917] group-hover:text-[#9A3412] transition-colors leading-snug mb-2 [text-wrap:balance]">
          {article.title}
        </h3>

        <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed line-clamp-2 mb-3">
          {article.subtitle}
        </p>
      </div>

      <div className="pt-3 border-t border-[#EAE5DC]/80 flex items-center justify-between text-xs text-[#78716C]">
        <span className="font-medium text-[#1C1917] truncate max-w-[150px]">
          {article.author.name}
        </span>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-[#A8A29E]" />
            <span className="tabular-nums font-mono text-[11px]">{commentsCount}</span>
          </span>

          {onBookmarkToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmarkToggle(e);
              }}
              className="p-1 hover:text-[#9A3412] transition-colors cursor-pointer"
              title={isBookmarked ? 'Desat' : 'Desar'}
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  isBookmarked ? 'fill-[#9A3412] text-[#9A3412]' : 'text-[#78716C]'
                }`}
              />
            </button>
          )}

          {isEditor && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(e);
              }}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xs transition-colors shadow-xs ml-1 cursor-pointer"
              title="Suprimir aquest document"
            >
              <Trash2 className="w-3 h-3 text-red-600" />
              <span>Suprimir</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
