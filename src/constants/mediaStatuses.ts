import type { MediaStatus } from "../types/media";
import type { StatusTone } from "./statuses";

export const MEDIA_STATUSES: {
  value: MediaStatus;
  label: string;
  tone: StatusTone;
}[] = [
  {
    value: "izlendi",
    label: "İzlendi",
    tone: {
      dot: "bg-turkuaz-500",
      tint: "bg-turkuaz-500/15 text-turkuaz-800 dark:text-turkuaz-300",
    },
  },
  {
    value: "izlenecek",
    label: "İzlenecek",
    tone: {
      dot: "bg-elektrik-500",
      tint: "bg-elektrik-500/15 text-elektrik-800 dark:text-elektrik-300",
    },
  },
];

export const MEDIA_STATUS_LABEL: Record<MediaStatus, string> =
  Object.fromEntries(MEDIA_STATUSES.map((s) => [s.value, s.label])) as Record<
    MediaStatus,
    string
  >;

export const MEDIA_STATUS_TONE: Record<MediaStatus, StatusTone> =
  Object.fromEntries(MEDIA_STATUSES.map((s) => [s.value, s.tone])) as Record<
    MediaStatus,
    StatusTone
  >;
