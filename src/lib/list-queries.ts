import { db } from '@/server/db';
import type { ItemFormValues } from '@/server/db/schema';
import { items, parseImageUris, stringifyImageUris } from '@/server/db/schema';
import { mutationOptions, queryOptions, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';


// ─── Keys ────────────────────────────────────────────────────────────────────
export const queryKeys = {
  items: () => ['items'] as const,
  item: (id: number) => ['items', id] as const,
  lists: () => ['lists'] as const,
  list: (id: number) => ['lists', id] as const,
  listItems: (listId: number) => ['lists', listId, 'items'] as const,
};

// ─── Items ───────────────────────────────────────────────────────────────────
export const allItemsOptions = () => queryOptions({
  queryKey: queryKeys.items(),
  queryFn: async () => {
    const rows = await db.select().from(items).orderBy(items.sortOrder);
    return rows.map(r => ({ ...r, imageUris: parseImageUris(r.imageUris) }));
  },
});

export const itemOptions = (id: number) => queryOptions({
  queryKey: queryKeys.item(id),
  queryFn: async () => {
    const [row] = await db.select().from(items).where(eq(items.id, id));
    if (!row) throw new Error(`Item ${id} nicht gefunden`);
    return { ...row, imageUris: parseImageUris(row.imageUris) };
  },
});

// ─── Item Mutations ───────────────────────────────────────────────────────────
export const dynamicItemMutationOptions = (id: number | undefined) => id
  ? updateItemMutationOptions(id)
  : createItemMutationOptions()


export const createItemMutationOptions = () => {
  const qc = useQueryClient();
  return mutationOptions({
    mutationFn: async (data: ItemFormValues) => {
      const { imageUris, ...rest } = data;
      const [created] = await db.insert(items)
        .values({
          ...rest,
          imageUris: stringifyImageUris(imageUris ?? []),
        })
        .returning();
      return created;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.items() }),
  });
}

export const updateItemMutationOptions = (id: number) => {
  const qc = useQueryClient();

  return mutationOptions({
    mutationFn: async (data: ItemFormValues) => {
      const { imageUris, ...rest } = data;
      const [created] = await db.update(items)
        .set({
          ...rest,
          imageUris: stringifyImageUris(imageUris ?? []),
        })
        .where(eq(items.id, id))
        .returning();
      return created;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.items() });
      qc.invalidateQueries({ queryKey: queryKeys.item(id) });
    },
  });
}

export const deleteItemMutationOptions = (id: number) => {
  const qc = useQueryClient();
  return mutationOptions({
    mutationFn: () => db.delete(items).where(eq(items.id, id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.items() }),
  });
}
