import React, { useState, useEffect } from 'react';
import { Article, Comment } from '../types';
import { CATEGORIES } from '../data/initialData';
import {
  Bookmark,
  Share2,
  ArrowLeft,
  MessageSquare,
  Check,
  Sun,
  Moon,
  Coffee,
  Heart,
  CornerDownRight,
  ShieldCheck,
  Sparkles,
  FileText,
  Download,
  ExternalLink,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { addComment, toggleBookmark, toggleLikeComment } from '../lib/storage';
import { formatArticleFullDate } from '../lib/dateUtils';

interface ArticleViewProps {
  article: Article;
  comments: Comment[];
  isBookmarked: boolean;
  onBookmarkChange: () => void;
  onBack: () => void;
  onCategoryClick: (categoryId: string) => void;
  onCommentsUpdated: () => void;
  isEditor?: boolean;
  onDeleteArticle?: (articleId: string) => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  article,
  comments,
  isBookmarked,
  onBookmarkChange,
  onBack,
  onCategoryClick,
  onCommentsUpdated,
  isEditor,
  onDeleteArticle,
}) => {
  const [readingTheme, setReadingTheme] = useState<'paper' | 'white' | 'dark'>('paper');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Comment submission state
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [commentSubmittedMessage, setCommentSubmittedMessage] = useState<string | null>(null);

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categoryName =
    CATEGORIES.find((c) => c.id === article.category)?.name || article.category;

  const formattedDate = formatArticleFullDate(article.publishedAt);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleBookmarkToggle = () => {
    toggleBookmark(article.id);
    onBookmarkChange();
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentBody.trim()) return;

    addComment({
      articleId: article.id,
      articleTitle: article.title,
      authorName: commentAuthor,
      authorEmail: commentEmail,
      content: commentBody,
      replyToId: replyingToId || undefined,
    });

    setCommentBody('');
    setReplyingToId(null);
    setCommentSubmittedMessage("El vostre comentari s'ha enviat correctament a redacció i apareixerà un cop aprovat.");
    onCommentsUpdated();

    setTimeout(() => {
      setCommentSubmittedMessage(null);
    }, 8000);
  };

  const handleLike = (commentId: string) => {
    toggleLikeComment(commentId);
    onCommentsUpdated();
  };

  // Only show approved comments in reader view
  const approvedComments = comments.filter(
    (c) => c.articleId === article.id && c.status === 'approved'
  );

  // Group top-level comments and replies
  const topLevelComments = approvedComments.filter((c) => !c.replyToId);
  const replies = approvedComments.filter((c) => c.replyToId);

  // Theme container classes
  const themeClasses = {
    paper: 'bg-[#FBF9F5] text-[#1C1917]',
    white: 'bg-white text-[#18181B]',
    dark: 'bg-[#181614] text-[#E7E2D8]',
  }[readingTheme];

  return (
    <div className={`min-h-screen ${themeClasses} transition-colors pb-24`}>
      {/* Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-[#9A3412] z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Reader Control Bar */}
      <div className="sticky top-[58px] z-30 bg-inherit/95 backdrop-blur-xs border-b border-[#E7E2D8] py-2 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-medium hover:text-[#9A3412] transition-colors py-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tornar a la portada</span>
          </button>

          <div className="flex items-center gap-4">
            {/* Reading Mode Theme Selector */}
            <div className="flex items-center gap-1 border border-[#DDD5C7] rounded-sm px-1.5 py-0.5">
              <button
                onClick={() => setReadingTheme('paper')}
                className={`p-1 rounded cursor-pointer ${
                  readingTheme === 'paper' ? 'bg-[#EAE4D7] text-[#9A3412]' : 'hover:text-[#9A3412]'
                }`}
                title="Format de paper clàssic"
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReadingTheme('white')}
                className={`p-1 rounded cursor-pointer ${
                  readingTheme === 'white' ? 'bg-zinc-200 text-zinc-900' : 'hover:text-[#9A3412]'
                }`}
                title="Format blanc clar"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReadingTheme('dark')}
                className={`p-1 rounded cursor-pointer ${
                  readingTheme === 'dark' ? 'bg-zinc-800 text-amber-200' : 'hover:text-[#9A3412]'
                }`}
                title="Format nocturn fosc"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bookmark button */}
            <button
              onClick={handleBookmarkToggle}
              className={`p-1.5 rounded-sm border border-[#DDD5C7] transition-colors cursor-pointer ${
                isBookmarked ? 'text-[#9A3412] bg-[#F3EFE6]' : 'hover:text-[#9A3412]'
              }`}
              title={isBookmarked ? 'Desat als vostres favorits' : 'Desar document'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#9A3412]' : ''}`} />
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1 p-1.5 rounded-sm border border-[#DDD5C7] hover:text-[#9A3412] transition-colors cursor-pointer"
              title="Compartir enllaç"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] text-emerald-600 font-medium">Enllaç copiat</span>
                </>
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Editor Direct Delete Action */}
            {isEditor && onDeleteArticle && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-900 transition-colors text-xs font-semibold ml-2 cursor-pointer shadow-xs"
                title="Suprimir document"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden sm:inline">Suprimir document</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Reading Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        {/* Category & Metadata Header */}
        <div className="flex items-center gap-2 text-xs text-[#78716C] mb-4 font-sans-editorial">
          <button
            onClick={() => onCategoryClick(article.category)}
            className="font-bold uppercase tracking-wider text-[#9A3412] hover:underline cursor-pointer"
          >
            {categoryName}
          </button>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{formattedDate}</span>
          {article.pdfFileName && (
            <>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-[#9A3412]">
                <FileText className="w-3 h-3" />
                Document PDF
              </span>
            </>
          )}
        </div>

        {/* Display Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-editorial font-bold leading-[1.15] tracking-tight mb-6 [text-wrap:balance]">
          {article.title}
        </h1>

        {/* Subtitle / Deck */}
        <p className="text-lg sm:text-xl text-[#57534E] leading-relaxed italic font-editorial pb-6 border-b border-[#E7E2D8] mb-6">
          {article.subtitle}
        </p>

        {/* Author Byline */}
        <div className="flex items-center justify-between pb-8 mb-8 border-b border-[#E7E2D8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E5DFD3] text-[#1C1917] flex items-center justify-center font-editorial font-bold text-base border border-[#DDD5C7]">
              {article.author.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-sm sm:text-base leading-tight">
                {article.author.name}
              </div>
              <div className="text-xs text-[#78716C]">{article.author.role}</div>
            </div>
          </div>

          <a
            href="#comentaris"
            className="flex items-center gap-1.5 text-xs text-[#78716C] hover:text-[#9A3412] font-medium"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="font-mono text-sm">{approvedComments.length}</span>
            <span className="hidden sm:inline">
              {approvedComments.length === 1 ? 'comentari' : 'comentaris'}
            </span>
          </a>
        </div>

        {/* Cover Image if any */}
        {article.imageUrl && (
          <figure className="mb-8">
            <div className="overflow-hidden rounded-xs bg-[#EFE9DF] border border-[#DDD5C7] aspect-16/10">
              <img
                src={article.imageUrl}
                alt={article.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            {article.imageCaption && (
              <figcaption className="text-xs font-editorial italic text-[#78716C] mt-2 px-1">
                {article.imageCaption}
              </figcaption>
            )}
          </figure>
        )}

        {/* PDF DOCUMENT INTEGRATED READER */}
        {article.pdfUrl ? (
          <div className="mb-12 space-y-4">
            <div className="p-4 sm:p-5 bg-[#F5F0E6] border border-[#DDD5C7] rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xs bg-[#9A3412] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono text-xs sm:text-sm font-semibold text-[#1C1917] truncate max-w-sm sm:max-w-md">
                    {article.pdfFileName || 'Document PDF'}
                  </h3>
                  <div className="text-[11px] text-[#78716C] mt-0.5">
                    {article.pdfFileSize ? `${article.pdfFileSize} · ` : ''}
                    Document complet per a lectura reposada
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={article.pdfUrl}
                  download={article.pdfFileName || `${article.title}.pdf`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1917] hover:bg-[#322D29] text-white text-xs font-semibold rounded-xs shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#E7E2D8]" />
                  <span>Descarregar PDF</span>
                </a>
                <a
                  href={article.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DDD5C7] text-[#1C1917] hover:bg-[#EAE4D7] text-xs font-medium rounded-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#78716C]" />
                  <span>Obrir pestanya</span>
                </a>
              </div>
            </div>

            {/* Embedded PDF Canvas / Viewer */}
            <div className="w-full h-[720px] sm:h-[880px] bg-white border border-[#DDD5C7] rounded-xs overflow-hidden shadow-xs">
              <iframe
                src={article.pdfUrl}
                title={article.title}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        ) : article.content ? (
          /* Fallback content if any text exists */
          <div className="font-editorial text-base sm:text-lg leading-relaxed sm:leading-loose space-y-6 text-[#292524]">
            {article.content.split('\n\n').map((paragraph, index) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;
              return (
                <p key={index} className="leading-relaxed">
                  {trimmed}
                </p>
              );
            })}
          </div>
        ) : null}

        {/* Author Bio Box */}
        <div className="mt-12 p-6 bg-[#F3EFE6] border border-[#DDD5C7] rounded-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1C1917] text-white flex items-center justify-center font-editorial font-bold text-lg shrink-0">
            {article.author.name.charAt(0)}
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-[#9A3412] font-semibold">
              Sobre l'autor
            </span>
            <h4 className="text-base font-editorial font-bold text-[#1C1917] mt-0.5">
              {article.author.name}
            </h4>
            <p className="text-xs sm:text-sm text-[#57534E] mt-1 leading-relaxed">
              {article.author.bio || article.author.role}
            </p>
          </div>
        </div>

        {/* COMMENT SECTION */}
        <section id="comentaris" className="mt-16 pt-10 border-t-2 border-[#1C1917]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-editorial font-bold text-[#1C1917] flex items-center gap-2">
                <span>Comentaris i debat dels lectors</span>
                <span className="font-mono text-sm text-[#78716C] font-normal">
                  ({approvedComments.length})
                </span>
              </h3>
              <p className="text-xs text-[#78716C] mt-1">
                Deixeu la vostra reflexió sobre aquest text.
              </p>
            </div>
          </div>

          {/* Submission Feedback Alert */}
          {commentSubmittedMessage && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xs text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">
                  Comentari enviat a moderació
                </span>
                {commentSubmittedMessage}
              </div>
            </div>
          )}

          {/* New Comment Form */}
          <form
            onSubmit={handleCommentSubmit}
            className="mb-12 p-5 bg-[#F5F0E6] border border-[#E0D8CB] rounded-xs"
          >
            <h4 className="text-sm font-semibold text-[#1C1917] mb-3 flex items-center justify-between">
              <span>{replyingToId ? 'Respondre al comentari...' : 'Deixeu la vostra reflexió'}</span>
              {replyingToId && (
                <button
                  type="button"
                  onClick={() => setReplyingToId(null)}
                  className="text-xs text-[#9A3412] hover:underline cursor-pointer"
                >
                  Cancel·lar resposta
                </button>
              )}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#78716C] mb-1">
                  El vostre nom *
                </label>
                <input
                  type="text"
                  required
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder="Ex: Maria Font"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#DDD5C7] rounded-xs focus:outline-none focus:border-[#9A3412]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#78716C] mb-1">
                  Correu electrònic (opcional)
                </label>
                <input
                  type="email"
                  value={commentEmail}
                  onChange={(e) => setCommentEmail(e.target.value)}
                  placeholder="maria@exemple.cat"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#DDD5C7] rounded-xs focus:outline-none focus:border-[#9A3412]"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-[11px] uppercase tracking-wider text-[#78716C] mb-1">
                La vostra aportació o reflexió *
              </label>
              <textarea
                required
                rows={3}
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Aporteu arguments, dubtes o matisos al debat..."
                className="w-full p-3 text-xs bg-white border border-[#DDD5C7] rounded-xs focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#78716C] italic">
                Els comentaris es moderen prèviament per preservar la qualitat del diàleg.
              </span>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1C1917] hover:bg-[#38332F] rounded-xs transition-colors cursor-pointer"
              >
                Enviar comentari
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {topLevelComments.length === 0 ? (
              <div className="text-center py-8 text-sm text-[#78716C] font-editorial italic border border-dashed border-[#DDD5C7] rounded-xs p-6">
                Encara no hi ha comentaris publicats. Sigueu el primer a opinar!
              </div>
            ) : (
              topLevelComments.map((comment) => {
                const commentReplies = replies.filter((r) => r.replyToId === comment.id);
                const commentDate = new Intl.DateTimeFormat('ca-ES', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(comment.createdAt));

                return (
                  <div
                    key={comment.id}
                    className="p-4 bg-white/70 border border-[#E7E2D8] rounded-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#1C1917]">
                          {comment.authorName}
                        </span>
                        {comment.isEditorialPick && (
                          <span className="text-[10px] text-[#9A3412] font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Comentari destacat
                          </span>
                        )}
                        {comment.isStaffReply && (
                          <span className="text-[10px] bg-[#1C1917] text-white px-1.5 py-0.5 rounded-xs font-medium">
                            Redacció
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#A8A29E] font-mono">{commentDate}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed mb-3">
                      {comment.content}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-[#78716C]">
                      <button
                        onClick={() => handleLike(comment.id)}
                        className="flex items-center gap-1 hover:text-[#9A3412] transition-colors cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span className="tabular-nums font-mono text-[11px]">{comment.likes}</span>
                      </button>

                      <button
                        onClick={() => {
                          setReplyingToId(comment.id);
                          const el = document.getElementById('comentaris');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex items-center gap-1 hover:text-[#1C1917] transition-colors cursor-pointer"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                        <span>Respondre</span>
                      </button>
                    </div>

                    {/* Nested Replies */}
                    {commentReplies.length > 0 && (
                      <div className="mt-4 pt-3 pl-4 border-l-2 border-[#DDD5C7] space-y-3">
                        {commentReplies.map((reply) => (
                          <div key={reply.id} className="pt-2 text-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-[#1C1917]">
                                {reply.authorName}
                              </span>
                              {reply.isStaffReply && (
                                <span className="text-[9px] bg-[#9A3412] text-white px-1 rounded-xs font-semibold">
                                  Redacció
                                </span>
                              )}
                              <span className="text-[10px] text-[#A8A29E]">
                                {new Intl.DateTimeFormat('ca-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                }).format(new Date(reply.createdAt))}
                              </span>
                            </div>
                            <p className="text-[#57534E] leading-relaxed">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* In-App Delete Confirmation Modal (Does not use window.confirm) */}
      {isDeleteModalOpen && (
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
                Esteu a punt de suprimir definitivament el document de la pàgina web:
              </p>
              <p className="font-editorial font-bold text-sm text-[#9A3412] px-3 py-2 bg-[#FBF9F5] border border-[#DDD5C7] rounded-xs break-words">
                "{article.title}"
              </p>
              <p className="text-[11px] text-[#78716C] leading-relaxed">
                Aquesta acció eliminarà el document i els seus comentaris associats de manera irreversible.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE5DC]">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#57534E] hover:text-[#1C1917] bg-[#F4EFE6] hover:bg-[#EAE4D7] rounded-xs transition-colors cursor-pointer"
              >
                Cancel·lar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  if (onDeleteArticle) {
                    onDeleteArticle(article.id);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Suprimir definitivament</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
