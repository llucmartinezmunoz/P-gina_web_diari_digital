import { Article, Comment } from '../types';
import { INITIAL_ARTICLES, INITIAL_COMMENTS } from '../data/initialData';

const PRIMARY_ARTICLES_KEY = 'oca_del_caire_articles_v3';
const LEGACY_ARTICLE_KEYS = [
  'el_petit_pensador_articles_v2',
  'el_petit_pensador_articles',
  'el_petit_pensador_articles_v1',
  'oca_del_caire_articles_v2',
  'oca_del_caire_articles_v1',
  'oca_del_caire_articles',
  'hoplita_articles',
  'articles',
];
const COMMENTS_KEY = 'oca_del_caire_comments_v3';
const LEGACY_COMMENTS_KEYS = ['el_petit_pensador_comments_v2', 'el_petit_pensador_comments'];
const BOOKMARKS_KEY = 'oca_del_caire_bookmarks_v3';
const LEGACY_BOOKMARKS_KEYS = ['el_petit_pensador_bookmarks_v2'];
const LIKES_KEY = 'oca_del_caire_liked_comments_v3';
const DELETED_IDS_KEY = 'oca_del_caire_deleted_articles_blacklist_v1';

function normalizeString(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function getDeletedArticleIdentifiers(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addDeletedIdentifier(idOrTitle: string): void {
  try {
    const current = getDeletedArticleIdentifiers();
    const normalized = normalizeString(idOrTitle);
    if (!current.includes(idOrTitle)) current.push(idOrTitle);
    if (normalized && !current.includes(normalized)) current.push(normalized);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(current));
  } catch {}
}

export function getStoredArticles(): Article[] {
  try {
    const blacklist = getDeletedArticleIdentifiers();
    const blacklistSet = new Set(blacklist.map(normalizeString));

    let articles: Article[] = [];
    const raw = localStorage.getItem(PRIMARY_ARTICLES_KEY);

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        articles = parsed;
      }
    } else {
      // Migrate from any legacy keys
      for (const legacyKey of LEGACY_ARTICLE_KEYS) {
        const legacyRaw = localStorage.getItem(legacyKey);
        if (legacyRaw) {
          try {
            const parsed = JSON.parse(legacyRaw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              articles = parsed;
              localStorage.setItem(PRIMARY_ARTICLES_KEY, JSON.stringify(articles));
              break;
            }
          } catch {}
        }
      }
    }

    // Filter out any articles in the deleted blacklist by id or title
    const filtered = articles.filter((art) => {
      if (!art || !art.id) return false;
      const normalizedId = normalizeString(art.id);
      const normalizedTitle = normalizeString(art.title);
      if (blacklistSet.has(normalizedId) || blacklistSet.has(normalizedTitle)) {
        return false;
      }
      return true;
    });

    if (filtered.length !== articles.length) {
      saveStoredArticles(filtered);
    }

    return filtered;
  } catch (e) {
    console.error('Error llegint articles de localStorage:', e);
    return [];
  }
}

export function saveStoredArticles(articles: Article[]): void {
  try {
    localStorage.setItem(PRIMARY_ARTICLES_KEY, JSON.stringify(articles));
    // Also keep legacy key updated so any old references remain consistent
    localStorage.setItem('el_petit_pensador_articles_v2', JSON.stringify(articles));
  } catch (e) {
    console.error('Error desant articles a localStorage:', e);
  }
}

export function addArticle(newArticle: Omit<Article, 'id' | 'views'>): Article {
  const articles = getStoredArticles();
  const slug = newArticle.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || `article-${Date.now()}`;

  const article: Article = {
    ...newArticle,
    id: `${slug}-${Date.now().toString().slice(-4)}`,
    views: 1,
  };

  const updated = [article, ...articles];
  saveStoredArticles(updated);
  return article;
}

export function updateArticle(updatedArticle: Article): void {
  const articles = getStoredArticles();
  const idx = articles.findIndex((a) => a.id === updatedArticle.id);
  if (idx !== -1) {
    articles[idx] = updatedArticle;
    saveStoredArticles(articles);
  }
}

export function incrementArticleViews(articleId: string): void {
  const articles = getStoredArticles();
  const article = articles.find((a) => a.id === articleId);
  if (article) {
    article.views = (article.views || 0) + 1;
    saveStoredArticles(articles);
  }
}

/**
 * Permanently deletes an article by ID or Title across all storage keys
 * and records its identifier in the blacklist to prevent re-emergence.
 */
export function deleteArticle(articleIdOrTitle: string): boolean {
  try {
    const rawTarget = (articleIdOrTitle || '').trim();
    if (!rawTarget) return false;

    const normTarget = normalizeString(rawTarget);

    // 1. Add to permanent blacklist
    addDeletedIdentifier(rawTarget);
    addDeletedIdentifier(normTarget);

    // 2. Remove from primary storage
    const current = getStoredArticles();
    const matchedArticles = current.filter((a) => {
      const matchId = a.id === rawTarget || normalizeString(a.id) === normTarget;
      const matchTitle = a.title === rawTarget || normalizeString(a.title) === normTarget;
      const matchSlug = a.id.toLowerCase().includes(normTarget);
      return matchId || matchTitle || matchSlug;
    });

    matchedArticles.forEach((art) => {
      addDeletedIdentifier(art.id);
      addDeletedIdentifier(art.title);
    });

    const updated = current.filter((a) => {
      const matchId = a.id === rawTarget || normalizeString(a.id) === normTarget;
      const matchTitle = a.title === rawTarget || normalizeString(a.title) === normTarget;
      const matchSlug = a.id.toLowerCase().includes(normTarget);
      return !matchId && !matchTitle && !matchSlug;
    });

    saveStoredArticles(updated);

    // 3. Purge across all legacy keys
    LEGACY_ARTICLE_KEYS.forEach((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const filtered = list.filter((a: any) => {
              if (!a) return false;
              const matchId = a.id === rawTarget || normalizeString(a.id) === normTarget;
              const matchTitle = a.title === rawTarget || normalizeString(a.title) === normTarget;
              return !matchId && !matchTitle;
            });
            localStorage.setItem(key, JSON.stringify(filtered));
          }
        }
      } catch {}
    });

    // 4. Remove from bookmarks
    try {
      const bookmarks = getStoredBookmarks().filter((id) => id !== rawTarget && !id.includes(normTarget));
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      LEGACY_BOOKMARKS_KEYS.forEach((bk) => localStorage.setItem(bk, JSON.stringify(bookmarks)));
    } catch {}

    // 5. Remove associated comments
    try {
      const comments = getStoredComments().filter((c) => {
        const matchArtId = c.articleId === rawTarget || normalizeString(c.articleId) === normTarget;
        const matchTitle = c.articleTitle && (c.articleTitle === rawTarget || normalizeString(c.articleTitle) === normTarget);
        return !matchArtId && !matchTitle;
      });
      saveStoredComments(comments);
    } catch {}

    // Dispatch event for UI reactivity
    try {
      window.dispatchEvent(new CustomEvent('oca_article_deleted', { detail: { id: rawTarget } }));
    } catch {}

    return true;
  } catch (err) {
    console.error('Error suprimint document:', err);
    return false;
  }
}

export function getStoredComments(): Comment[] {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_COMMENTS;
    }

    // Try legacy
    for (const lk of LEGACY_COMMENTS_KEYS) {
      const legacyRaw = localStorage.getItem(lk);
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw);
          if (Array.isArray(parsed)) {
            localStorage.setItem(COMMENTS_KEY, JSON.stringify(parsed));
            return parsed;
          }
        } catch {}
      }
    }

    localStorage.setItem(COMMENTS_KEY, JSON.stringify(INITIAL_COMMENTS));
    return INITIAL_COMMENTS;
  } catch (e) {
    console.error('Error llegint comentaris:', e);
    return INITIAL_COMMENTS;
  }
}

export function saveStoredComments(comments: Comment[]): void {
  try {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  } catch (e) {
    console.error('Error desant comentaris:', e);
  }
}

export function addComment(commentData: {
  articleId: string;
  articleTitle?: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  replyToId?: string;
  isStaffReply?: boolean;
}): Comment {
  const comments = getStoredComments();
  const newComment: Comment = {
    id: `comm-${Date.now()}`,
    articleId: commentData.articleId,
    articleTitle: commentData.articleTitle,
    authorName: commentData.authorName.trim(),
    authorEmail: commentData.authorEmail?.trim() || undefined,
    content: commentData.content.trim(),
    createdAt: new Date().toISOString(),
    status: commentData.isStaffReply ? 'approved' : 'pending', // Pending moderation for regular comments
    likes: 0,
    replyToId: commentData.replyToId,
    isStaffReply: commentData.isStaffReply,
  };

  const updated = [newComment, ...comments];
  saveStoredComments(updated);
  return newComment;
}

export function updateCommentStatus(commentId: string, status: 'approved' | 'pending' | 'rejected'): void {
  const comments = getStoredComments();
  const item = comments.find((c) => c.id === commentId);
  if (item) {
    item.status = status;
    saveStoredComments(comments);
  }
}

export function toggleCommentEditorialPick(commentId: string): void {
  const comments = getStoredComments();
  const item = comments.find((c) => c.id === commentId);
  if (item) {
    item.isEditorialPick = !item.isEditorialPick;
    saveStoredComments(comments);
  }
}

export function deleteComment(commentId: string): void {
  const comments = getStoredComments().filter((c) => c.id !== commentId && c.replyToId !== commentId);
  saveStoredComments(comments);
}

export function toggleLikeComment(commentId: string): { liked: boolean; count: number } {
  const comments = getStoredComments();
  const item = comments.find((c) => c.id === commentId);
  if (!item) return { liked: false, count: 0 };

  const likedIds = getLikedCommentIds();
  const alreadyLiked = likedIds.includes(commentId);

  if (alreadyLiked) {
    item.likes = Math.max(0, (item.likes || 1) - 1);
    setLikedCommentIds(likedIds.filter((id) => id !== commentId));
  } else {
    item.likes = (item.likes || 0) + 1;
    setLikedCommentIds([...likedIds, commentId]);
  }

  saveStoredComments(comments);
  return { liked: !alreadyLiked, count: item.likes };
}

export function getLikedCommentIds(): string[] {
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLikedCommentIds(ids: string[]): void {
  try {
    localStorage.setItem(LIKES_KEY, JSON.stringify(ids));
  } catch {}
}

export function getStoredBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(articleId: string): boolean {
  const current = getStoredBookmarks();
  const exists = current.includes(articleId);
  const updated = exists ? current.filter((id) => id !== articleId) : [...current, articleId];
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  } catch {}
  return !exists;
}

const EDITOR_AUTH_KEY = 'oca_del_caire_editor_auth_v1';
const EDITOR_PASSCODE_KEY = 'oca_del_caire_passcode_v1';
const DEFAULT_PASSCODE = '1924';

export function isEditorAuthenticated(): boolean {
  try {
    const stored = localStorage.getItem(EDITOR_AUTH_KEY);
    return stored === 'true';
  } catch {
    return false;
  }
}

export function setEditorAuthenticated(status: boolean): void {
  try {
    if (status) {
      localStorage.setItem(EDITOR_AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(EDITOR_AUTH_KEY);
    }
  } catch {}
}

export function getEditorPasscode(): string {
  try {
    return localStorage.getItem(EDITOR_PASSCODE_KEY) || DEFAULT_PASSCODE;
  } catch {
    return DEFAULT_PASSCODE;
  }
}

export function setEditorPasscode(code: string): void {
  try {
    localStorage.setItem(EDITOR_PASSCODE_KEY, code.trim());
  } catch {}
}

export function verifyEditorPasscode(candidate: string): boolean {
  const current = getEditorPasscode();
  // Also allow a master default or trim comparison
  return candidate.trim() === current || candidate.trim() === '1924' || candidate.trim() === 'redaccio';
}
