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
export const createItemMutationOptions = () => mutationOptions({
  mutationFn: async (data: ItemFormValues) => {
    const [created] = await db.insert(items)
      .values(stringifyItem(data))
      .returning()
    return created
  },
  onSuccess: (_data, _variables, _onMutateResult, context) => {
    context.client.invalidateQueries({ queryKey: queryKeys.items() })
  },
})

export const updateItemMutationOptions = () => mutationOptions({
  mutationFn: async ({ itemId, data }: { itemId: number, data: ItemFormValues }) => {
    const [updated] = await db.update(items)
      .set(stringifyItem(data))
      .where(eq(items.id, itemId))
      .returning()
    return updated
  },
  onSuccess: (_data, _variables, _onMutateResult, context) => {
    context.client.invalidateQueries({ queryKey: queryKeys.items() })
  },
})

export const deleteItemMutationOptions = () => mutationOptions({
  mutationFn: async ({ itemId }: { itemId: number }) => {
    await db.delete(items).where(eq(items.id, itemId))
  },
  onSuccess: (_data, _variables, _onMutateResult, context) => {
    context.client.invalidateQueries({ queryKey: queryKeys.items() })
  },
})
