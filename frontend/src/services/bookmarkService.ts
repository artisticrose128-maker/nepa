import { Transaction } from '../types';

const BOOKMARKS_KEY = 'nepa_bookmarks';

export interface Bookmark {
  id: string;
  type: 'transaction' | 'meter' | 'content';
  title: string;
  data: any;
  createdAt: string;
}

class BookmarkService {
  getBookmarks(): Bookmark[] {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse bookmarks', e);
      return [];
    }
  }

  addBookmark(bookmark: Omit<Bookmark, 'createdAt'>): void {
    const bookmarks = this.getBookmarks();
    if (bookmarks.some(b => b.id === bookmark.id)) return;
    
    const newBookmark: Bookmark = {
      ...bookmark,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...bookmarks, newBookmark]));
  }

  removeBookmark(id: string): void {
    const bookmarks = this.getBookmarks();
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks.filter(b => b.id !== id)));
  }

  isBookmarked(id: string): boolean {
    const bookmarks = this.getBookmarks();
    return bookmarks.some(b => b.id === id);
  }

  toggleBookmark(bookmark: Omit<Bookmark, 'createdAt'>): boolean {
    if (this.isBookmarked(bookmark.id)) {
      this.removeBookmark(bookmark.id);
      return false;
    } else {
      this.addBookmark(bookmark);
      return true;
    }
  }
}

export default new BookmarkService();
