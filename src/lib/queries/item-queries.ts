import { db } from '@/server/db';
import type { ItemFormValues } from '@/server/db/schema';
import { items } from '@/server/db/schema';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
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

export const createItemMutationOptions = () => mutationOptions({
  mutationFn: async (data: ItemFormValues) => {
    const [created] = await db.insert(items)
      .values(stringifyItem(data))
      .returning()
    return created
  },
})

export const updateItemMutationOptions = (id: number) => mutationOptions({
  mutationFn: async (data: ItemFormValues) => {
    const [updated] = await db.update(items)
      .set(stringifyItem(data))
      .where(eq(items.id, id))
      .returning()
    return updated
  },
})

export const deleteItemMutationOptions = (id: number) => mutationOptions({
  mutationFn: async () => {
    await db.delete(items).where(eq(items.id, id))
  },
})
