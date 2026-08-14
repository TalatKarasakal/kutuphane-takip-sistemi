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
      dot: "bg-success",
      badge: "border-success bg-success text-white dark:text-app",
    },
  },
  {
    value: "izlenecek",
    label: "İzlenecek",
    tone: {
      dot: "bg-glow",
      badge: "border-glow bg-glow text-white",
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
