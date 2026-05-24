import { db } from '@/server/db';
import type { ItemFormValues } from '@/server/db/schema';
import { items } from '@/server/db/schema';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import { deleteImageFromAppStorage, diffImageUris, persistImages } from "../utils";
import { parseItem, queryKeys, stringifyItem } from "./_helper";


// ─── Items ───────────────────────────────────────────────────────────────────
export const allItemsQueryOptions = () => queryOptions({
  queryKey: queryKeys.items(),
  queryFn: async () => {
    const rows = await db.select().from(items);
    return rows.map(parseItem);
  },
  refetchOnMount: false,
})

export const itemQueryOptions = (id: number) => queryOptions({
  queryKey: queryKeys.item(id),
  queryFn: async () => {
    const [row] = await db.select().from(items).where(eq(items.id, id));
    if (!row) throw new Error(`Item ${id} nicht gefunden`);
    return parseItem(row);
  },
})

// ─── Item Mutations ───────────────────────────────────────────────────────────
export const createItemMutationOptions = () => mutationOptions({
  mutationFn: async (data: ItemFormValues) => {
    // save images to app storage
    const persistedFilenames = await persistImages(data.imageUris ?? [])

    // save item with successfully persisted images
    const [created] = await db.insert(items)
      .values(stringifyItem({ ...data, imageUris: persistedFilenames }))
      .returning()
    return created
  },
  onSuccess: (_data, _variables, _onMutateResult, context) => {
    context.client.invalidateQueries({ queryKey: queryKeys.items() })
  },
})

export const updateItemMutationOptions = () => mutationOptions({
  mutationFn: async ({ itemId, data }: { itemId: number, data: ItemFormValues }) => {
    const [currentItem] = await db.select().from(items).where(eq(items.id, itemId))
    const currentImageUris = parseItem(currentItem).imageUris

    const { added, removed } = diffImageUris(currentImageUris, data.imageUris ?? [])

    // save images to app storage
    const persistedNew = await persistImages(added)

    // untouched + newly persisted images
    const finalUris = [
      ...currentImageUris.filter((uri) => !removed.includes(uri)),
      ...persistedNew,
    ]

    // update data in db
    const [updated] = await db.update(items)
      .set(stringifyItem({ ...data, imageUris: finalUris }))
      .where(eq(items.id, itemId))
      .returning()

    // delete remove images after successful db update
    removed.forEach(deleteImageFromAppStorage)

    return updated
  },
  onSuccess: (_data, _variables, _onMutateResult, context) => {
    context.client.invalidateQueries({ queryKey: queryKeys.items() })
  },
})

export const deleteItemMutationOptions = () => mutationOptions({
  mutationFn: async ({ itemId }: { itemId: number }) => {
    // delete item
    const [deletedItem] = await db.delete(items)
      .where(eq(items.id, itemId))
      .returning()
    const parsedDeleteItem = parseItem(deletedItem)

    // clean up all referenced images
    parsedDeleteItem.imageUris.forEach(deleteImageFromAppStorage)
  },
  onSuccess: (_data, _variables, _onMutateResult, context) => {
    context.client.invalidateQueries({ queryKey: queryKeys.items() })
  },
})
