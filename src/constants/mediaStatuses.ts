import type { MediaStatus } from '../types/media';

export const MEDIA_STATUSES: { value: MediaStatus; label: string; color: string }[] = [
  { value: 'izlendi', label: 'İzlendi', color: 'emerald' },
  { value: 'izlenecek', label: 'İzlenecek', color: 'sky' },
];

export const MEDIA_STATUS_LABEL: Record<MediaStatus, string> = Object.fromEntries(
  MEDIA_STATUSES.map((s) => [s.value, s.label]),
) as Record<MediaStatus, string>;
