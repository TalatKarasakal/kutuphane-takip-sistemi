import type { Tag } from "../types/library";

export interface TagGroup<T> {
  id: string;
  label: string;
  color?: string;
  items: T[];
}

export function groupByPrimaryTag<T extends { tagIds?: string[] }>(
  items: T[],
  tags: Tag[],
): TagGroup<T>[] {
  const known = new Map(tags.map((tag) => [tag.id, tag]));
  const groups = new Map<string, TagGroup<T>>();

  for (const item of items) {
    const tag = item.tagIds?.map((id) => known.get(id)).find(Boolean);
    const id = tag?.id ?? "__untagged__";
    const group = groups.get(id) ?? {
      id,
      label: tag?.name ?? "Etiketsiz",
      color: tag?.color,
      items: [],
    };
    group.items.push(item);
    groups.set(id, group);
  }

  return [...groups.values()].sort((left, right) => {
    if (left.id === "__untagged__") return 1;
    if (right.id === "__untagged__") return -1;
    return left.label.localeCompare(right.label, "tr");
  });
}
