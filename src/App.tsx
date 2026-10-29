/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Article, CategoryId, Comment } from './types';
import {
  getStoredArticles,
  getStoredComments,
  getStoredBookmarks,
  toggleBookmark,
  incrementArticleViews,
  isEditorAuthenticated,
  setEditorAuthenticated,
  deleteArticle,
} from './lib/storage';
import { Header } from './components/Header';
import { SectionBlock } from './components/SectionBlock';
import { ArticleView } from './components/ArticleView';
import { ArticleEditor } from './components/ArticleEditor';
import { CommentModerator } from './components/CommentModerator';
import { SearchModal } from './components/SearchModal';
import { EditorAuthModal } from './components/EditorAuthModal';
import { Footer } from './components/Footer';
import { MANIFESTO_TEXT, CATEGORIES } from './data/initialData';
import {
  Bookmark,
  X,
  Compass,
  Eye,
  KeyRound,
  LogOut,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  Check,
} from 'lucide-react';

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [cardArticleToDelete, setCardArticleToDelete] = useState<Article | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Editor Authentication & Public Reader Visibility
  // Only the editor ('jo') can see publishing tabs and moderation
  const [isEditor, setIsEditor] = useState<boolean>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('editor') === 'true' || urlParams.get('redaccio') === 'true') {
      setEditorAuthenticated(true);
      return true;
    }
    return isEditorAuthenticated();
  });
  const [isPreviewAsReader, setIsPreviewAsReader] = useState<boolean>(false);
  const [isEditorLoginOpen, setIsEditorLoginOpen] = useState<boolean>(false);

  // Navigation & Filter States
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'totes'>('totes');
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState<boolean>(false);

  // Modals & Panels
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorInitialCategory, setEditorInitialCategory] = useState<CategoryId>('escrits-personals');
  const [isModeratorOpen, setIsModeratorOpen] = useState(false);

  // Sync document title and HTML lang attribute
  useEffect(() => {
    document.title = "L'oca del Caire · Diari digital";
    document.documentElement.lang = 'ca';
  }, []);

  // Initial load & storage sync
  useEffect(() => {
    refreshData();

    const handleSync = () => refreshData();
    window.addEventListener('oca_article_deleted', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('oca_article_deleted', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Global keyboard shortcut for search (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const refreshData = () => {
    const loadedArticles = getStoredArticles();
    setArticles(loadedArticles);
    setComments(getStoredComments());
    setBookmarks(getStoredBookmarks());
    setActiveArticleId((prev) => {
      if (prev && !loadedArticles.some((a) => a.id === prev)) {
        return null;
      }
      return prev;
    });
  };

  const confirmDeleteCardArticle = () => {
    if (!cardArticleToDelete) return;
    const deletedTitle = cardArticleToDelete.title;
    deleteArticle(cardArticleToDelete.id);
    setCardArticleToDelete(null);
    refreshData();
    setFeedbackToast(`El document "${deletedTitle}" ha estat suprimit definitivament.`);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleOpenArticle = (articleId: string) => {
    incrementArticleViews(articleId);
    setActiveArticleId(articleId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookmarkToggle = (articleId: string) => {
    toggleBookmark(articleId);
    setBookmarks(getStoredBookmarks());
  };

  const handleCategorySelect = (cat: CategoryId | 'totes') => {
    setSelectedCategory(cat);
    setShowBookmarksOnly(false);
    setActiveArticleId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEditorForCategory = (catId: CategoryId) => {
    setEditorInitialCategory(catId);
    setIsEditorOpen(true);
  };

  // Precompute comments count map per article
  const commentsCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    comments.forEach((c) => {
      if (c.status === 'approved') {
        map[c.articleId] = (map[c.articleId] || 0) + 1;
      }
    });
    return map;
  }, [comments]);

  // Pending comments count for moderation badge
  const pendingCommentsCount = useMemo(() => {
    return comments.filter((c) => c.status === 'pending').length;
  }, [comments]);

  // Active article object if reader view is active
  const activeArticle = useMemo(() => {
    if (!activeArticleId) return null;
    return articles.find((a) => a.id === activeArticleId) || null;
  }, [activeArticleId, articles]);

  // Group articles by the 3 distinct sections
  const escritsPersonalsArticles = useMemo(() => {
    return articles.filter((a) => a.category === 'escrits-personals');
  }, [articles]);

  const opinioArticles = useMemo(() => {
    return articles.filter((a) => a.category === 'opinio');
  }, [articles]);

  const assajosArticles = useMemo(() => {
    return articles.filter((a) => a.category === 'assajos');
  }, [articles]);

  // Filtered set for bookmark view
  const bookmarkedArticles = useMemo(() => {
    if (!showBookmarksOnly) return null;
    return articles.filter((art) => bookmarks.includes(art.id));
  }, [articles, showBookmarksOnly, bookmarks]);

  // Whether publishing tabs and moderation controls are currently active and visible
  const canPublish = isEditor && !isPreviewAsReader;

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1917] flex flex-col font-sans-editorial">
      {/* Editor Status Banner (Visible only when editor is logged in) */}
      {isEditor && (
        <div className="bg-[#1C1917] text-[#E7E2D8] px-4 sm:px-8 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-black select-none z-50">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-semibold text-white tracking-wide">
              {isPreviewAsReader ? 'Mode simulació de lector públic' : 'Sessió de redacció activa'}
            </span>
            <span className="text-[#A8A29E] hidden md:inline">
              · {isPreviewAsReader ? 'Esteu comprovant què veu un visitant qualsevol' : 'Pestanyes de publicació i moderació visibles només per a vós'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {!isPreviewAsReader && (
              <button
                onClick={() => setIsModeratorOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#9A3412] hover:bg-[#B43D15] text-white rounded-xs text-[11px] font-semibold transition-colors shadow-xs cursor-pointer"
                title="Gestió de documents i moderació de comentaris"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Gestió & Moderació</span>
                {pendingCommentsCount > 0 && (
                  <span className="bg-white text-[#9A3412] text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                    {pendingCommentsCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setIsPreviewAsReader(!isPreviewAsReader)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-medium transition-colors cursor-pointer ${
                isPreviewAsReader
                  ? 'bg-[#9A3412] text-white shadow-xs'
                  : 'bg-[#2E2926] hover:bg-[#3D3733] text-[#DDD5C7]'
              }`}
              title="Permet comprovar exactament què veu un lector públic"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPreviewAsReader ? 'Sortir de la vista lector' : 'Provar com a lector'}</span>
            </button>

            <button
              onClick={() => setIsEditorLoginOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#2E2926] hover:bg-[#3D3733] text-[#DDD5C7] rounded-xs text-[11px] transition-colors cursor-pointer"
              title="Codi PIN de redacció"
            >
              <KeyRound className="w-3 h-3 text-[#A8A29E]" />
              <span className="hidden sm:inline">Codi PIN</span>
            </button>

            <button
              onClick={() => {
                setEditorAuthenticated(false);
                setIsEditor(false);
                setIsPreviewAsReader(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-red-300 hover:text-white hover:bg-red-950/40 rounded-xs transition-colors cursor-pointer"
              title="Tancar sessió"
            >
              <LogOut className="w-3 h-3" />
              <span>Tancar sessió</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        activeCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenEditor={() => {
          setEditorInitialCategory(selectedCategory !== 'totes' ? selectedCategory : 'escrits-personals');
          setIsEditorOpen(true);
        }}
        onOpenModerator={() => setIsModeratorOpen(true)}
        onOpenBookmarks={() => {
          setShowBookmarksOnly(true);
          setSelectedCategory('totes');
          setActiveArticleId(null);
        }}
        onOpenEditorLogin={() => setIsEditorLoginOpen(true)}
        isEditor={canPublish}
        bookmarksCount={bookmarks.length}
        pendingCommentsCount={pendingCommentsCount}
        onNavigateHome={() => {
          setActiveArticleId(null);
          setShowBookmarksOnly(false);
          setSelectedCategory('totes');
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        {activeArticle ? (
          /* Reader View */
          <ArticleView
            article={activeArticle}
            comments={comments}
            isBookmarked={bookmarks.includes(activeArticle.id)}
            onBookmarkChange={refreshData}
            onBack={() => setActiveArticleId(null)}
            onCategoryClick={(catId) => handleCategorySelect(catId as CategoryId)}
            onCommentsUpdated={refreshData}
            isEditor={canPublish}
            onDeleteArticle={(articleId) => {
              const target = articles.find((a) => a.id === articleId);
              const title = target?.title || 'Document';
              deleteArticle(articleId);
              setActiveArticleId(null);
              refreshData();
              setFeedbackToast(`El document "${title}" ha estat suprimit definitivament.`);
              setTimeout(() => setFeedbackToast(null), 4000);
            }}
          />
        ) : (
          /* Frontpage / Section View */
          <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
            {/* The Editorial Manifesto */}
            <div className="mb-12 p-6 sm:p-8 bg-[#F5F0E6] border border-[#DDD5C7] rounded-xs relative">
              <div className="max-w-4xl mx-auto text-center space-y-3">
                <span className="text-[10px] tracking-widest uppercase font-semibold text-[#9A3412] font-sans-editorial">
                  Declaració fundacional
                </span>
                <p className="font-editorial text-lg sm:text-2xl text-[#1C1917] leading-relaxed italic [text-wrap:balance]">
                  «{MANIFESTO_TEXT}»
                </p>
                <div className="pt-1 flex items-center justify-center gap-3 text-xs text-[#78716C]">
                  <span>Barcelona</span>
                  <span aria-hidden="true">·</span>
                  <span>Escrits personals</span>
                  <span aria-hidden="true">·</span>
                  <span>Articles d'opinió</span>
                  <span aria-hidden="true">·</span>
                  <span>Assajos</span>
                </div>
              </div>
            </div>

            {/* Active Bookmarks Notice Ribbon */}
            {showBookmarksOnly && (
              <div className="mb-8 p-4 bg-[#F3EFE6] border border-[#DDD5C7] rounded-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#9A3412]" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#78716C]">
                    Filtre actiu:
                  </span>
                  <span className="font-editorial text-base font-bold text-[#1C1917]">
                    {bookmarks.length === 1 ? '1 document desat' : `${bookmarks.length} documents desats`}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedCategory('totes');
                    setShowBookmarksOnly(false);
                  }}
                  className="text-xs font-semibold text-[#9A3412] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Tornar a la portada general
                </button>
              </div>
            )}

            {/* If filtering by Bookmark */}
            {bookmarkedArticles !== null ? (
              bookmarkedArticles.length === 0 ? (
                <div className="py-20 text-center text-[#78716C] max-w-md mx-auto">
                  <Compass className="w-10 h-10 mx-auto mb-3 text-[#C8BFB0]" />
                  <h3 className="text-2xl font-editorial font-bold text-[#1C1917] mb-2">
                    No teniu cap document desat
                  </h3>
                  <p className="text-xs leading-relaxed mb-6">
                    Mentre llegiu documents o exploreu les tres seccions, feu clic a la icona de desar per trobar-los ràpidament aquí.
                  </p>
                  <button
                    onClick={() => setShowBookmarksOnly(false)}
                    className="px-4 py-2 bg-[#1C1917] text-xs font-semibold text-white rounded-xs hover:bg-[#322D29] cursor-pointer"
                  >
                    Tornar a la portada
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {bookmarkedArticles.map((art) => (
                    <SectionBlock
                      key={art.id}
                      categoryId={art.category}
                      articles={[art]}
                      commentsCountMap={commentsCountMap}
                      bookmarks={bookmarks}
                      isEditor={canPublish}
                      onOpenArticle={handleOpenArticle}
                      onBookmarkToggle={handleBookmarkToggle}
                      onCategoryClick={(catId) => handleCategorySelect(catId)}
                      onOpenEditorForCategory={handleOpenEditorForCategory}
                      onDeleteArticle={(article) => setCardArticleToDelete(article)}
                    />
                  ))}
                </div>
              )
            ) : (
              /* The 3 Dedicated Newspaper Sections with Placeholders / Articles */
              <div className="space-y-12">
                {/* 1. ESCRITS PERSONALS */}
                {(selectedCategory === 'totes' || selectedCategory === 'escrits-personals') && (
                  <SectionBlock
                    categoryId="escrits-personals"
                    articles={escritsPersonalsArticles}
                    commentsCountMap={commentsCountMap}
                    bookmarks={bookmarks}
                    isEditor={canPublish}
                    onOpenArticle={handleOpenArticle}
                    onBookmarkToggle={handleBookmarkToggle}
                    onCategoryClick={(catId) => handleCategorySelect(catId)}
                    onOpenEditorForCategory={handleOpenEditorForCategory}
                    onDeleteArticle={(article) => setCardArticleToDelete(article)}
                  />
                )}

                {/* 2. ARTICLES D'OPINIÓ */}
                {(selectedCategory === 'totes' || selectedCategory === 'opinio') && (
                  <SectionBlock
                    categoryId="opinio"
                    articles={opinioArticles}
                    commentsCountMap={commentsCountMap}
                    bookmarks={bookmarks}
                    isEditor={canPublish}
                    onOpenArticle={handleOpenArticle}
                    onBookmarkToggle={handleBookmarkToggle}
                    onCategoryClick={(catId) => handleCategorySelect(catId)}
                    onOpenEditorForCategory={handleOpenEditorForCategory}
                    onDeleteArticle={(article) => setCardArticleToDelete(article)}
                  />
                )}

                {/* 3. ASSAJOS */}
                {(selectedCategory === 'totes' || selectedCategory === 'assajos') && (
                  <SectionBlock
                    categoryId="assajos"
                    articles={assajosArticles}
                    commentsCountMap={commentsCountMap}
                    bookmarks={bookmarks}
                    isEditor={canPublish}
                    onOpenArticle={handleOpenArticle}
                    onBookmarkToggle={handleBookmarkToggle}
                    onCategoryClick={(catId) => handleCategorySelect(catId)}
                    onOpenEditorForCategory={handleOpenEditorForCategory}
                    onDeleteArticle={(article) => setCardArticleToDelete(article)}
                  />
                )}
              </div>
            )}
          </main>
        )}
      </div>

      {/* Global Modals */}
      {/* 1. Internal Search Engine */}
      <SearchModal
        articles={articles}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectArticle={(art) => {
          handleOpenArticle(art.id);
          setIsSearchOpen(false);
        }}
        initialCategory={selectedCategory}
        commentsCountMap={commentsCountMap}
      />

      {/* 2. Article Publishing Studio (Accessible ONLY if authorized) */}
      {isEditorOpen && canPublish && (
        <ArticleEditor
          initialCategory={editorInitialCategory}
          onClose={() => setIsEditorOpen(false)}
          onArticleCreated={(newArt) => {
            refreshData();
            setIsEditorOpen(false);
            handleOpenArticle(newArt.id);
          }}
        />
      )}

      {/* 3. Comment Management & Moderation Panel (Accessible ONLY if authorized) */}
      {isModeratorOpen && canPublish && (
        <CommentModerator
          comments={comments}
          articles={articles}
          onClose={() => setIsModeratorOpen(false)}
          onCommentsUpdated={refreshData}
          onArticlesUpdated={refreshData}
          onViewArticle={(articleId) => {
            handleOpenArticle(articleId);
            setIsModeratorOpen(false);
          }}
        />
      )}

      {/* 4. Editor Authentication Modal */}
      <EditorAuthModal
        isOpen={isEditorLoginOpen}
        onClose={() => setIsEditorLoginOpen(false)}
        isAlreadyAuthenticated={isEditor}
        onAuthenticated={() => {
          setIsEditor(true);
          setIsPreviewAsReader(false);
          refreshData();
        }}
      />

      {/* Minimalist Footer with Manifesto */}
      <Footer
        onCategoryClick={handleCategorySelect}
        onOpenModerator={() => setIsModeratorOpen(true)}
        onOpenEditor={() => {
          setEditorInitialCategory('escrits-personals');
          setIsEditorOpen(true);
        }}
        onOpenEditorLogin={() => setIsEditorLoginOpen(true)}
        isEditor={canPublish}
      />

      {/* Direct In-App Delete Confirmation Modal for Cards */}
      {cardArticleToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DDD5C7] rounded-xs shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-editorial text-lg font-bold text-[#1C1917]">
                Confirmar supressió de document
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Esteu a punt de suprimir definitivament el document de la portada:
              </p>
              <p className="font-editorial font-bold text-sm text-[#9A3412] px-3 py-2 bg-[#FBF9F5] border border-[#DDD5C7] rounded-xs break-words">
                "{cardArticleToDelete.title}"
              </p>
              <p className="text-[11px] text-[#78716C] leading-relaxed">
                Aquesta acció eliminarà el document i els seus comentaris associats de manera irreversible.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE5DC]">
              <button
                type="button"
                onClick={() => setCardArticleToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-[#57534E] hover:text-[#1C1917] bg-[#F4EFE6] hover:bg-[#EAE4D7] rounded-xs transition-colors cursor-pointer"
              >
                Cancel·lar
              </button>
              <button
                type="button"
                onClick={confirmDeleteCardArticle}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Suprimir definitivament</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Feedback Toast */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1917] text-[#E7E2D8] border border-[#9A3412] px-4 py-3 rounded-xs shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-[#9A3412] text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium">{feedbackToast}</span>
          <button
            onClick={() => setFeedbackToast(null)}
            className="text-[#A8A29E] hover:text-white ml-2 text-sm font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
