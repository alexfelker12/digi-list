import { db } from '@/server/db';
import { items, listItems, ListItemsFormValues } from '@/server/db/schema';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import { parseItem, queryKeys } from "./_helper";


// ─── List items ───────────────────────────────────────────────────────────
export const listItemsQueryOptions = (listId: number) => queryOptions({
  queryKey: queryKeys.listItems(listId),
  queryFn: async () => {
    const listItemsByListId = await db.select({
      id: listItems.id,
      listId: listItems.listId,
      itemId: listItems.itemId,
      quantity: listItems.quantity,
      unit: listItems.unit,
      notes: listItems.notes,
      checked: listItems.checked,
      sortOrder: listItems.sortOrder,

      item: {
        id: items.id,
        name: items.name,
        imageUris: items.imageUris,
      }
    })
      .from(listItems)
      .innerJoin(items, eq(listItems.itemId, items.id))
      .where(eq(listItems.listId, listId))
      .orderBy(listItems.sortOrder)

    const parsedListItemsByListId = listItemsByListId.map(({ item, ...rest }) => ({
      ...rest,
      item: parseItem(item)
    }))

    return parsedListItemsByListId
  },
});

// ─── List item Mutations ───────────────────────────────────────────────────────────
export const updateListItemsMutationOptions = (listId: number) => mutationOptions({
  mutationFn: async ({ listItems: formListItems }: ListItemsFormValues) => {
    return await db.transaction(async (tx) => {
      // delete all list items
      await tx.delete(listItems).where(eq(listItems.listId, listId))

      // recreate with updated values (without item and listId from top level function)
      const listItemsWithoutIds = formListItems.map(
        ({ id, item, listId: _, ...rest }) => ({ ...rest, listId })
      )

      return await tx.insert(listItems)
        .values(listItemsWithoutIds)
        .returning()
    })
  },
})
