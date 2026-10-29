export type CategoryId = 'escrits-personals' | 'opinio' | 'assajos';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
}

export interface Author {
  name: string;
  role: string;
  bio?: string;
  avatarUrl?: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  leadParagraph?: string;
  content?: string; // Optional abstract or notes
  category: CategoryId;
  author: Author;
  publishedAt: string;
  readTimeMinutes: number;
  imageUrl?: string;
  imageCaption?: string;
  pdfUrl?: string; // Base64 data URL or external URL of the uploaded PDF
  pdfFileName?: string;
  pdfFileSize?: string;
  featured?: boolean;
  editorialPick?: boolean;
  views: number;
  allowComments: boolean;
}

export interface Comment {
  id: string;
  articleId: string;
  articleTitle?: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'rejected';
  likes: number;
  isEditorialPick?: boolean;
  replyToId?: string;
  isStaffReply?: boolean;
}

export type SortOption = 'recent' | 'popular' | 'comments';

export interface SearchFilterState {
  query: string;
  category: CategoryId | 'totes';
  sort: SortOption;
}
