import { db } from '@/server/db';
import type { ItemFormValues } from '@/server/db/schema';
import { items } from '@/server/db/schema';
import { mutationOptions, queryOptions, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import { parseItem, queryKeys, stringifyItem } from "./_helper";


// ─── Items ───────────────────────────────────────────────────────────────────
export const allItemsQueryOptions = () => queryOptions({
  queryKey: queryKeys.items(),
  queryFn: async () => {
    const rows = await db.select().from(items);
    return rows.map(parseItem);
  },
});

export const itemQueryOptions = (id: number) => queryOptions({
  queryKey: queryKeys.item(id),
  queryFn: async () => {
    const [row] = await db.select().from(items).where(eq(items.id, id));
    if (!row) throw new Error(`Item ${id} nicht gefunden`);
    return parseItem(row);
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
      const [created] = await db.insert(items)
        .values(stringifyItem(data))
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
      const [created] = await db.update(items)
        .set(stringifyItem(data))
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
