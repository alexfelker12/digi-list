import { ItemFormValues, parseImageUris, stringifyImageUris, type Item } from '@/server/db/schema';

export type ParsedItem = Omit<Item, "imageUris"> & { imageUris: string[] }

// ─── Keys ────────────────────────────────────────────────────────────────────
export const queryKeys = {
  items: () => ['items'] as const,
  item: (id: number) => ['items', id] as const,
  lists: () => ['lists'] as const,
  list: (id: number) => ['lists', id] as const,
  listItems: (listId: number) => ['lists', listId, 'items'] as const,
  checkedCount: (listId: number) => ['lists', listId, 'checked'] as const,
};

export const parseItem = ({ imageUris, ...rest }: Item): ParsedItem => {
  return {
    ...rest,
    imageUris: parseImageUris(imageUris)
  }
}

export const stringifyItem = ({ imageUris, ...rest }: ItemFormValues) => {
  return {
    ...rest,
    imageUris: stringifyImageUris(imageUris ?? []),
  }
}
