export type MediaStatus = 'izlendi' | 'izlenecek';
export type MediaType = 'film' | 'dizi';

export interface Media {
  id: string;
  title: string;
  type: MediaType;
  director?: string;
  releaseYear?: number;
  watchYear?: number;
  duration?: number;
  seasons?: number;
  episodeDuration?: number;
  status: MediaStatus;
  notes?: string;
  addedAt: string;
  updatedAt: string;
}
