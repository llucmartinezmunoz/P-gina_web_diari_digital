import React, { useState } from 'react';
import { Comment, Article, CategoryId } from '../types';
import { CATEGORIES } from '../data/initialData';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Trash2,
  Sparkles,
  MessageSquare,
  Search,
  X,
  CornerDownRight,
  Send,
  AlertTriangle,
  ExternalLink,
  FileText,
  Eye,
  Calendar,
  User,
  FolderKanban,
  Check,
  ArrowUpRight,
} from 'lucide-react';
import {
  updateCommentStatus,
  toggleCommentEditorialPick,
  deleteComment,
  addComment,
  deleteArticle,
} from '../lib/storage';

interface CommentModeratorProps {
  comments: Comment[];
  articles: Article[];
  onClose: () => void;
  onCommentsUpdated: () => void;
  onArticlesUpdated?: () => void;
  onViewArticle: (articleId: string) => void;
  initialMode?: 'documents' | 'comments';
}

export const CommentModerator: React.FC<CommentModeratorProps> = ({
  comments,
  articles,
  onClose,
  onCommentsUpdated,
  onArticlesUpdated,
  onViewArticle,
  initialMode = 'documents',
}) => {
  // Main Panel Mode: Documents Management or Comments Moderation
  const [activePanel, setActivePanel] = useState<'documents' | 'comments'>(initialMode);

  // Document Management States
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [docCategoryFilter, setDocCategoryFilter] = useState<CategoryId | 'totes'>('totes');
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  // Comments Moderation States
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [commentSearchQuery, setCommentSearchQuery] = useState('');
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3800);
  };

  // Document deletion handler
  const confirmDeleteArticle = () => {
    if (!articleToDelete) return;
    const deletedTitle = articleToDelete.title;
    deleteArticle(articleToDelete.id);
    setArticleToDelete(null);
    if (onArticlesUpdated) {
      onArticlesUpdated();
    }
    onCommentsUpdated();
    showNotification(`El document "${deletedTitle}" ha estat suprimit definitivament.`);
  };

  // Comment handlers
  const handleApproveComment = (commentId: string) => {
    updateCommentStatus(commentId, 'approved');
    onCommentsUpdated();
    showNotification('Comentari aprovat i visible públicament.');
  };

  const handleRejectComment = (commentId: string) => {
    updateCommentStatus(commentId, 'rejected');
    onCommentsUpdated();
    showNotification('Comentari marcat com a rebutjat.');
  };

  const confirmDeleteComment = () => {
    if (!commentToDelete) return;
    deleteComment(commentToDelete.id);
    setCommentToDelete(null);
    onCommentsUpdated();
    showNotification('Comentari suprimit de la base de dades.');
  };

  const handleToggleHighlight = (commentId: string) => {
    toggleCommentEditorialPick(commentId);
    onCommentsUpdated();
  };

  const handleSendEditorialReply = (targetComment: Comment) => {
    if (!replyText.trim()) return;

    addComment({
      articleId: targetComment.articleId,
      articleTitle: targetComment.articleTitle,
      authorName: "Redacció de L'oca del Caire",
      content: replyText.trim(),
      replyToId: targetComment.id,
      isStaffReply: true,
    });

    setReplyText('');
    setReplyingCommentId(null);
    onCommentsUpdated();
    showNotification('Resposta de la redacció publicada amb èxit.');
  };

  // Filtered documents
  const filteredArticles = articles.filter((art) => {
    if (docCategoryFilter !== 'totes' && art.category !== docCategoryFilter) {
      return false;
    }
    if (docSearchQuery.trim()) {
      const q = docSearchQuery.toLowerCase();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchSubtitle = (art.subtitle || '').toLowerCase().includes(q);
      const matchAuthor = art.author.name.toLowerCase().includes(q);
      const matchPdf = (art.pdfFileName || '').toLowerCase().includes(q);
      return matchTitle || matchSubtitle || matchAuthor || matchPdf;
    }
    return true;
  });

  // Filtered comments
  const filteredComments = comments.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (commentSearchQuery.trim()) {
      const q = commentSearchQuery.toLowerCase();
      const matchAuthor = c.authorName.toLowerCase().includes(q);
      const matchContent = c.content.toLowerCase().includes(q);
      const matchTitle = (c.articleTitle || '').toLowerCase().includes(q);
      return matchAuthor || matchContent || matchTitle;
    }
    return true;
  });

  const commentCounts = {
    all: comments.length,
    pending: comments.filter((c) => c.status === 'pending').length,
    approved: comments.filter((c) => c.status === 'approved').length,
    rejected: comments.filter((c) => c.status === 'rejected').length,
  };

  const formatDate = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat('ca-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  const getCategoryBadge = (catId: CategoryId) => {
    switch (catId) {
      case 'escrits-personals':
        return { name: 'Escrits personals', bg: 'bg-[#9A3412]/10 text-[#9A3412] border-[#9A3412]/30' };
      case 'opinio':
        return { name: "Articles d'opinió", bg: 'bg-stone-200 text-stone-800 border-stone-300' };
      case 'assajos':
        return { name: 'Assajos', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      default:
        return { name: catId, bg: 'bg-stone-100 text-stone-700 border-stone-300' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#FBF9F5] border border-[#DDD5C7] rounded-xs shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col text-[#1C1917] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E2D8] bg-[#F4EFE6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1C1917] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#E7E2D8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-editorial font-bold text-[#1C1917]">
                  Panell de Redacció i Moderació
                </h2>
                <span className="text-[10px] font-mono uppercase bg-[#1C1917] text-[#E7E2D8] px-2 py-0.5 rounded-xs font-semibold">
                  Exclusiu Editor
                </span>
              </div>
              <p className="text-[11px] text-[#78716C]">
                Gestioneu i suprimiu documents publicats o modereu els comentaris dels lectors
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#EAE5DC] rounded-xs text-[#78716C] hover:text-[#1C1917] transition-colors"
            title="Tancar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Feedback Notice */}
        {feedbackNotice && (
          <div className="mx-6 mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xs text-xs text-emerald-800 flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              {feedbackNotice}
            </span>
            <button
              onClick={() => setFeedbackNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* Top Mode Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-[#EAE5DC] bg-[#FAF8F3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePanel('documents')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activePanel === 'documents'
                  ? 'border-[#9A3412] text-[#9A3412] bg-[#F4EFE6]/70'
                  : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Gestió de Documents ({articles.length})</span>
            </button>

            <button
              onClick={() => setActivePanel('comments')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activePanel === 'comments'
                  ? 'border-[#9A3412] text-[#9A3412] bg-[#F4EFE6]/70'
                  : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Comentaris dels Lectors ({comments.length})</span>
              {commentCounts.pending > 0 && (
                <span className="bg-[#9A3412] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums">
                  {commentCounts.pending} pendents
                </span>
              )}
            </button>
          </div>
        </div>

        {/* PANEL 1: DOCUMENTS MANAGEMENT & DELETION */}
        {activePanel === 'documents' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter and Search Bar for Documents */}
            <div className="p-4 sm:p-6 border-b border-[#EAE5DC] space-y-3 bg-white/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <button
                    onClick={() => setDocCategoryFilter('totes')}
                    className={`px-3 py-1.5 rounded-xs font-medium transition-colors ${
                      docCategoryFilter === 'totes'
                        ? 'bg-[#1C1917] text-white font-semibold shadow-xs'
                        : 'bg-[#EAE4D7] text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    Tots ({articles.length})
                  </button>
                  {CATEGORIES.map((cat) => {
                    const count = articles.filter((a) => a.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setDocCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-xs font-medium transition-colors ${
                          docCategoryFilter === cat.id
                            ? 'bg-[#9A3412] text-white font-semibold shadow-xs'
                            : 'bg-[#EAE4D7] text-[#57534E] hover:text-[#1C1917]'
                        }`}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#78716C]" />
                  <input
                    type="text"
                    value={docSearchQuery}
                    onChange={(e) => setDocSearchQuery(e.target.value)}
                    placeholder="Cercar documents per títol, autor..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#DDD5C7] rounded-xs focus:outline-none focus:border-[#9A3412]"
                  />
                  {docSearchQuery && (
                    <button
                      onClick={() => setDocSearchQuery('')}
                      className="absolute right-2.5 top-2 text-[#78716C] hover:text-[#1C1917] text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 divide-y divide-[#EAE5DC]">
              {filteredArticles.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-12 h-12 rounded-full bg-[#EFE9DE] mx-auto flex items-center justify-center text-[#78716C] mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-editorial text-base font-bold text-[#1C1917] mb-1">
                    No s'ha trobat cap document
                  </h3>
                  <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                    {articles.length === 0
                      ? 'Encara no s’ha publicat cap document a L’oca del Caire. Utilitzeu el botó de redacció per a pujar el primer PDF.'
                      : 'No hi ha cap document que coincideixi amb els criteris de cerca o categoria seleccionats.'}
                  </p>
                </div>
              ) : (
                filteredArticles.map((art) => {
                  const badge = getCategoryBadge(art.category);
                  const articleCommentsCount = comments.filter((c) => c.articleId === art.id).length;

                  return (
                    <div
                      key={art.id}
                      className="pt-3.5 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-xs hover:bg-white/80 transition-colors border border-transparent hover:border-[#DDD5C7]"
                    >
                      {/* Left: Thumbnail & Main info */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Thumbnail image or fallback */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-[#EFE9DE] rounded-xs overflow-hidden border border-[#DDD5C7] relative group">
                          {art.imageUrl ? (
                            <img
                              src={art.imageUrl}
                              alt={art.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[#9A3412]">
                              <FileText className="w-7 h-7" />
                              <span className="text-[9px] font-mono mt-0.5">PDF</span>
                            </div>
                          )}
                          {art.pdfUrl && (
                            <span className="absolute bottom-1 right-1 bg-black/75 text-[9px] font-mono text-white px-1 py-0.2 rounded-xs">
                              PDF
                            </span>
                          )}
                        </div>

                        {/* Title, Category & Meta */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs border ${badge.bg}`}
                            >
                              {badge.name}
                            </span>
                            {art.featured && (
                              <span className="text-[10px] bg-[#1C1917] text-white px-1.5 py-0.5 rounded-xs font-semibold">
                                Destacat Portada
                              </span>
                            )}
                            {art.editorialPick && (
                              <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded-xs font-semibold flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                Recomanat
                              </span>
                            )}
                          </div>

                          <h3
                            onClick={() => {
                              onViewArticle(art.id);
                              onClose();
                            }}
                            className="font-editorial text-base sm:text-lg font-bold text-[#1C1917] hover:text-[#9A3412] cursor-pointer line-clamp-1 transition-colors"
                            title={art.title}
                          >
                            {art.title}
                          </h3>

                          {art.subtitle && (
                            <p className="text-xs text-[#57534E] line-clamp-1 italic font-editorial">
                              {art.subtitle}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#78716C] pt-0.5">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-[#A8A29E]" />
                              {art.author.name}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#A8A29E]" />
                              {formatDate(art.publishedAt)}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1 font-mono text-[#9A3412]">
                              <FileText className="w-3 h-3" />
                              {art.pdfFileName || 'document.pdf'}
                              {art.pdfFileSize && ` (${art.pdfFileSize})`}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-[#A8A29E]" />
                              {art.views || 0} lectures
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-[#A8A29E]" />
                              {articleCommentsCount} comentaris
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#EAE5DC] justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            onViewArticle(art.id);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-[#FAF8F3] hover:bg-white text-[#1C1917] border border-[#DDD5C7] rounded-xs text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                          title="Veure i llegir el document"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#78716C]" />
                          <span>Veure document</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setArticleToDelete(art)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-900 border border-red-200 hover:border-red-300 rounded-xs text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          title="Suprimir aquest document de L'oca del Caire"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          <span>Suprimir</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Document Footer Info */}
            <div className="px-6 py-3 border-t border-[#E7E2D8] bg-[#F4EFE6] text-xs text-[#78716C] flex items-center justify-between">
              <span>
                Mostrant {filteredArticles.length} de {articles.length} documents totals.
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold bg-[#1C1917] text-white rounded-xs hover:bg-[#38332F]"
              >
                Tancar panell
              </button>
            </div>
          </div>
        )}

        {/* PANEL 2: COMMENTS MODERATION */}
        {activePanel === 'comments' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter and Search Bar */}
            <div className="p-4 sm:p-6 border-b border-[#EAE5DC] space-y-4 bg-white/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-[#EAE4D7] rounded-xs text-xs">
                  <button
                    onClick={() => setFilterStatus('pending')}
                    className={`px-3 py-1.5 rounded-xs font-medium transition-colors flex items-center gap-1.5 ${
                      filterStatus === 'pending'
                        ? 'bg-white text-[#9A3412] font-semibold shadow-xs'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    <span>Pendents</span>
                    {commentCounts.pending > 0 && (
                      <span className="bg-[#9A3412] text-white text-[10px] px-1.5 rounded-full font-bold tabular-nums">
                        {commentCounts.pending}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setFilterStatus('approved')}
                    className={`px-3 py-1.5 rounded-xs font-medium transition-colors ${
                      filterStatus === 'approved'
                        ? 'bg-white text-[#1C1917] font-semibold shadow-xs'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    Aprovats ({commentCounts.approved})
                  </button>

                  <button
                    onClick={() => setFilterStatus('rejected')}
                    className={`px-3 py-1.5 rounded-xs font-medium transition-colors ${
                      filterStatus === 'rejected'
                        ? 'bg-white text-[#1C1917] font-semibold shadow-xs'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    Rebutjats ({commentCounts.rejected})
                  </button>

                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-xs font-medium transition-colors ${
                      filterStatus === 'all'
                        ? 'bg-white text-[#1C1917] font-semibold shadow-xs'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    Tots ({commentCounts.all})
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#78716C]" />
                  <input
                    type="text"
                    value={commentSearchQuery}
                    onChange={(e) => setCommentSearchQuery(e.target.value)}
                    placeholder="Filtrar per text, autor o article..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#DDD5C7] rounded-xs focus:outline-none focus:border-[#9A3412]"
                  />
                  {commentSearchQuery && (
                    <button
                      onClick={() => setCommentSearchQuery('')}
                      className="absolute right-2.5 top-2 text-[#78716C] hover:text-[#1C1917] text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {filteredComments.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-12 h-12 rounded-full bg-[#EFE9DE] mx-auto flex items-center justify-center text-[#78716C] mb-3">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="font-editorial text-base font-bold text-[#1C1917] mb-1">
                    No hi ha comentaris
                  </h3>
                  <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                    {filterStatus === 'pending'
                      ? 'No hi ha cap comentari pendent de moderació en aquests moments.'
                      : 'No s’ha trobat cap comentari amb els filtres actuals.'}
                  </p>
                </div>
              ) : (
                filteredComments.map((comment) => {
                  return (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-xs border transition-all ${
                        comment.status === 'pending'
                          ? 'bg-[#FFFDF7] border-[#E8DCC0] shadow-xs'
                          : comment.status === 'rejected'
                          ? 'bg-[#F9F7F5] border-[#E5E0D8] opacity-75'
                          : 'bg-white border-[#DDD5C7]'
                      }`}
                    >
                      {/* Comment Top Meta */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-[#F0EBE1]">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[#1C1917]">
                            {comment.authorName}
                          </span>
                          {comment.authorEmail && (
                            <span className="text-[11px] text-[#A8A29E] font-mono">
                              ({comment.authorEmail})
                            </span>
                          )}
                          {comment.isStaffReply && (
                            <span className="text-[9px] uppercase font-bold bg-[#1C1917] text-[#E7E2D8] px-1.5 py-0.5 rounded-xs">
                              Redacció
                            </span>
                          )}
                          <span className="text-[11px] text-[#78716C]">·</span>
                          <span className="text-[11px] text-[#78716C]">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          {comment.status === 'pending' && (
                            <span className="text-[10px] font-semibold text-[#9A3412] bg-[#9A3412]/10 px-2 py-0.5 rounded-xs">
                              Pendent de revisió
                            </span>
                          )}
                          {comment.status === 'approved' && (
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-xs">
                              Aprovat
                            </span>
                          )}
                          {comment.status === 'rejected' && (
                            <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-200 px-2 py-0.5 rounded-xs">
                              Rebutjat
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Associated Document */}
                      <div className="mb-2 text-xs">
                        <span className="text-[#78716C]">Aportació al document: </span>
                        <button
                          onClick={() => {
                            onViewArticle(comment.articleId);
                            onClose();
                          }}
                          className="font-medium text-[#9A3412] hover:underline inline-flex items-center gap-1 font-editorial font-bold"
                        >
                          {comment.articleTitle || comment.articleId}
                          <ArrowUpRight className="w-3 h-3 inline" />
                        </button>
                      </div>

                      {/* Content */}
                      <p className="text-xs text-[#292524] whitespace-pre-wrap leading-relaxed mb-3 font-serif">
                        {comment.content}
                      </p>

                      {/* Reply Editor Box if toggled */}
                      {replyingCommentId === comment.id && (
                        <div className="mt-2 mb-3 p-3 bg-[#F4EFE6] border border-[#DDD5C7] rounded-xs">
                          <label className="block text-[11px] font-semibold uppercase text-[#78716C] mb-1">
                            Resposta oficial com a Redacció de L'oca del Caire:
                          </label>
                          <textarea
                            rows={3}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Escriviu la resposta editorial pública..."
                            className="w-full p-2 text-xs bg-white border border-[#DDD5C7] rounded-xs focus:outline-none focus:border-[#9A3412] mb-2"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setReplyingCommentId(null)}
                              className="px-2.5 py-1 text-xs text-[#78716C] hover:text-[#1C1917]"
                            >
                              Cancel·lar
                            </button>
                            <button
                              onClick={() => handleSendEditorialReply(comment)}
                              className="px-3 py-1 bg-[#1C1917] hover:bg-[#38332F] text-white text-xs font-semibold rounded-xs flex items-center gap-1.5"
                            >
                              <Send className="w-3 h-3" />
                              Publicar resposta
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Actions Bar */}
                      <div className="pt-2 border-t border-[#EAE5DC] flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          {comment.status !== 'approved' && (
                            <button
                              onClick={() => handleApproveComment(comment.id)}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-xs flex items-center gap-1 font-medium transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Aprovar
                            </button>
                          )}

                          {comment.status !== 'rejected' && (
                            <button
                              onClick={() => handleRejectComment(comment.id)}
                              className="px-2.5 py-1 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-300 rounded-xs flex items-center gap-1 font-medium transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Rebutjar
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleHighlight(comment.id)}
                            className={`px-2.5 py-1 rounded-xs flex items-center gap-1 font-medium border transition-colors ${
                              comment.isEditorialPick
                                ? 'bg-[#9A3412] text-white border-[#9A3412]'
                                : 'bg-white text-[#78716C] border-[#DDD5C7] hover:text-[#9A3412]'
                            }`}
                            title="Marcar com a aportació destacada"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            {comment.isEditorialPick ? 'Destacat' : 'Destacar'}
                          </button>

                          <button
                            onClick={() => {
                              setReplyingCommentId(
                                replyingCommentId === comment.id ? null : comment.id
                              );
                            }}
                            className="px-2.5 py-1 bg-white text-[#57534E] hover:text-[#1C1917] border border-[#DDD5C7] rounded-xs flex items-center gap-1 font-medium transition-colors"
                          >
                            <CornerDownRight className="w-3.5 h-3.5" />
                            Respondre
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setCommentToDelete(comment)}
                          className="text-red-700 hover:text-red-900 p-1.5 transition-colors hover:bg-red-50 rounded-xs cursor-pointer"
                          title="Suprimir comentari definitivament"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer info */}
            <div className="px-6 py-3 border-t border-[#E7E2D8] bg-[#F4EFE6] text-xs text-[#78716C] flex items-center justify-between">
              <span>
                Mostrant {filteredComments.length} de {comments.length} comentaris totals.
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold bg-[#1C1917] text-white rounded-xs hover:bg-[#38332F]"
              >
                Tancar panell
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal for Documents */}
        {articleToDelete && (
          <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-[#DDD5C7] rounded-xs shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="font-editorial text-lg font-bold text-[#1C1917]">
                  Voleu suprimir aquest document?
                </h3>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  Esteu a punt de suprimir definitivament el document:
                </p>
                <p className="font-editorial font-bold text-sm text-[#9A3412] px-2 py-1 bg-[#FBF9F5] border border-[#DDD5C7] rounded-xs break-words">
                  "{articleToDelete.title}"
                </p>
                <p className="text-[11px] text-[#78716C]">
                  El fitxer PDF associat ({articleToDelete.pdfFileName || 'PDF'}) i tots els seus comentaris també s’eliminaran. Aquesta acció no es pot desfer.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE5DC]">
                <button
                  type="button"
                  onClick={() => setArticleToDelete(null)}
                  className="px-4 py-2 text-xs font-medium text-[#57534E] hover:text-[#1C1917] bg-[#F4EFE6] rounded-xs cursor-pointer"
                >
                  Cancel·lar
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteArticle}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Sí, suprimir document
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal for Comments */}
        {commentToDelete && (
          <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-[#DDD5C7] rounded-xs shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="font-editorial text-lg font-bold text-[#1C1917]">
                  Voleu suprimir aquest comentari?
                </h3>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  Autor: <strong className="text-[#1C1917]">{commentToDelete.authorName}</strong>
                </p>
                <p className="text-xs italic text-[#57534E] px-3 py-2 bg-[#FBF9F5] border border-[#DDD5C7] rounded-xs max-h-24 overflow-y-auto">
                  «{commentToDelete.content}»
                </p>
                <p className="text-[11px] text-[#78716C]">
                  Aquest comentari s'eliminarà de forma irreversible.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE5DC]">
                <button
                  type="button"
                  onClick={() => setCommentToDelete(null)}
                  className="px-4 py-2 text-xs font-medium text-[#57534E] hover:text-[#1C1917] bg-[#F4EFE6] rounded-xs cursor-pointer"
                >
                  Cancel·lar
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteComment}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Sí, suprimir comentari
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
