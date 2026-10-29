import React from 'react';
import { Article, CategoryId } from '../types';
import { ArticleCard } from './ArticleCard';
import { PenLine, Plus, Feather, BookOpen, MessageSquare } from 'lucide-react';
import { CATEGORIES } from '../data/initialData';

interface SectionBlockProps {
  categoryId: CategoryId;
  articles: Article[];
  commentsCountMap: Record<string, number>;
  bookmarks: string[];
  isEditor: boolean;
  onOpenArticle: (articleId: string) => void;
  onBookmarkToggle: (articleId: string) => void;
  onCategoryClick: (catId: CategoryId) => void;
  onOpenEditorForCategory: (catId: CategoryId) => void;
  onDeleteArticle?: (article: Article) => void;
}

export const SectionBlock: React.FC<SectionBlockProps> = ({
  categoryId,
  articles,
  commentsCountMap,
  bookmarks,
  isEditor,
  onOpenArticle,
  onBookmarkToggle,
  onCategoryClick,
  onOpenEditorForCategory,
  onDeleteArticle,
}) => {
  const catData = CATEGORIES.find((c) => c.id === categoryId);
  const categoryName = catData?.name || categoryId;
  const categoryDesc = catData?.description || '';

  const sectionIcons = {
    'escrits-personals': <Feather className="w-4 h-4 text-[#9A3412]" />,
    opinio: <MessageSquare className="w-4 h-4 text-[#9A3412]" />,
    assajos: <BookOpen className="w-4 h-4 text-[#9A3412]" />,
  };

  const emptyLabelsMap = {
    'escrits-personals': {
      title: 'Espai reservat per a Escrits Personals',
      hint: 'Aquí es publicaran textos de creació pròpia i pensament avantguardista en format PDF.',
      publicNote: 'Aquest espai acollirà ben aviat textos de creació pròpia i avantguarda.',
      cta: 'Publicar el primer escrit personal',
    },
    opinio: {
      title: "Espai reservat per a Articles d'Opinió",
      hint: 'Aquí es penjaran articles d’opinió i tribunes de debat crític en document PDF.',
      publicNote: 'Aquest espai s’obrirà ben aviat a la tribuna i al debat crític.',
      cta: "Publicar el primer article d'opinió",
    },
    assajos: {
      title: 'Espai reservat per a Assajos',
      hint: 'Aquí es publicaran assajos de fons, estudis i anàlisis pausades en format PDF.',
      publicNote: 'Espai destinat a assajos reposats, estudis i reflexions de fons.',
      cta: 'Publicar el primer assaig',
    },
  };

  const emptyLabels = emptyLabelsMap[categoryId] || {
    title: 'Espai reservat per a publicacions',
    hint: 'Aquí podreu penjar documents PDF propis.',
    publicNote: 'Contingut en preparació.',
    cta: 'Publicar document',
  };

  return (
    <section className="pb-12 border-b border-[#E7E2D8] last:border-b-0">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 mb-6 border-b-2 border-[#1C1917]">
        <div className="flex items-center gap-2.5">
          {sectionIcons[categoryId]}
          <div>
            <h2 className="text-xl sm:text-2xl font-editorial font-bold text-[#1C1917] tracking-tight">
              {categoryName}
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5 font-sans-editorial">
              {categoryDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-xs text-[#A8A29E]">
            {articles.length === 1 ? '1 publicació' : `${articles.length} publicacions`}
          </span>
          {isEditor && (
            <button
              onClick={() => onOpenEditorForCategory(categoryId)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#1C1917] bg-[#EFE9DF] hover:bg-[#E2DACD] rounded-xs transition-colors shadow-xs cursor-pointer"
              title="Afegir document a aquesta secció"
            >
              <Plus className="w-3.5 h-3.5 text-[#9A3412]" />
              <span>Afegir document</span>
            </button>
          )}
        </div>
      </div>

      {/* Content or Empty Placeholders */}
      {articles.length === 0 ? (
        /* Minimalist Empty Broadsheet Slot */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Empty Slot */}
          <div className="md:col-span-8 p-8 sm:p-10 border border-dashed border-[#DDD5C7] rounded-xs bg-[#F8F5EE]/60 flex flex-col items-center justify-center text-center transition-all hover:border-[#C4B9A7]">
            <div className="w-10 h-10 rounded-full bg-[#EAE3D5] flex items-center justify-center text-[#78716C] mb-3">
              <PenLine className="w-4 h-4 text-[#9A3412]" />
            </div>
            <h3 className="text-lg sm:text-xl font-editorial font-bold text-[#1C1917] mb-2">
              {emptyLabels.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#78716C] max-w-md leading-relaxed mb-4 font-editorial">
              {isEditor ? emptyLabels.hint : emptyLabels.publicNote}
            </p>

            {/* Publishing CTA only visible to the editor */}
            {isEditor ? (
              <button
                onClick={() => onOpenEditorForCategory(categoryId)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1C1917] hover:bg-[#322D29] text-white text-xs font-semibold rounded-xs shadow-xs transition-colors mt-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#E7E2D8]" />
                <span>{emptyLabels.cta}</span>
              </button>
            ) : (
              <div className="text-[11px] font-sans-editorial text-[#A8A29E] italic mt-1">
                En preparació editorial
              </div>
            )}
          </div>

          {/* Secondary Empty Column Note */}
          <div className="md:col-span-4 p-6 border border-[#E7E2D8] rounded-xs bg-[#FAF8F3] flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#9A3412] font-semibold block mb-1">
                Quadern de redacció
              </span>
              <h4 className="font-editorial text-base font-bold text-[#1C1917] mb-2">
                Espai de lectura reposada
              </h4>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Tots els documents d'aquesta secció es publiquen en format de document per a una experiència de lectura íntegra i fidel al disseny tipogràfic original.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#EAE5DC] text-[11px] text-[#A8A29E] italic">
              Barcelona · Edició digital
            </div>
          </div>
        </div>
      ) : (
        /* Real Articles Display */
        <div className="space-y-6">
          {/* If there's 1 article: show prominent */}
          {articles.length === 1 ? (
            <ArticleCard
              article={articles[0]}
              variant="lead"
              commentsCount={commentsCountMap[articles[0].id] || 0}
              isBookmarked={bookmarks.includes(articles[0].id)}
              onBookmarkToggle={() => onBookmarkToggle(articles[0].id)}
              onClick={() => onOpenArticle(articles[0].id)}
              onCategoryClick={(catId) => onCategoryClick(catId as CategoryId)}
              isEditor={isEditor}
              onDelete={() => onDeleteArticle?.(articles[0])}
            />
          ) : (
            /* If multiple articles: Lead article + standard grid */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
              <div className="md:col-span-7">
                <ArticleCard
                  article={articles[0]}
                  variant="standard"
                  commentsCount={commentsCountMap[articles[0].id] || 0}
                  isBookmarked={bookmarks.includes(articles[0].id)}
                  onBookmarkToggle={() => onBookmarkToggle(articles[0].id)}
                  onClick={() => onOpenArticle(articles[0].id)}
                  onCategoryClick={(catId) => onCategoryClick(catId as CategoryId)}
                  isEditor={isEditor}
                  onDelete={() => onDeleteArticle?.(articles[0])}
                />
              </div>
              <div className="md:col-span-5 divide-y divide-[#EAE5DC]">
                {articles.slice(1).map((art) => (
                  <ArticleCard
                    key={art.id}
                    article={art}
                    variant={categoryId === 'opinio' ? 'opinion' : 'compact'}
                    commentsCount={commentsCountMap[art.id] || 0}
                    isBookmarked={bookmarks.includes(art.id)}
                    onBookmarkToggle={() => onBookmarkToggle(art.id)}
                    onClick={() => onOpenArticle(art.id)}
                    onCategoryClick={(catId) => onCategoryClick(catId as CategoryId)}
                    isEditor={isEditor}
                    onDelete={() => onDeleteArticle?.(art)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
