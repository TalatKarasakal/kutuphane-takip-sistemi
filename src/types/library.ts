export const TAG_COLORS = [
  "#14b8a6",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#22c55e",
  "#ec4899",
  "#64748b",
] as const;

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveLoan {
  bookId: string;
  borrower: string;
  loanedAt: string;
  dueAt?: string;
}

export type ArtworkOwnerType = "book" | "media";

export interface ArtworkCache {
  key: string;
  ownerType: ArtworkOwnerType;
  ownerId: string;
  sourceUrl: string;
  blob: Blob;
  mimeType: string;
  size: number;
  lastAccessedAt: string;
  updatedAt: string;
}

export type TagFilterMode = "or" | "and";
