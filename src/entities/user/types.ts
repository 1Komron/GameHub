export interface RecentOpponent {
  userId: number;
  name: string;
  lastPlayedAt: string;
  isOnline: boolean;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  totalPages: number;
  totalElements: number;
}
