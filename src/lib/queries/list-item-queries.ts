import { db } from '@/server/db';
import { items, listItems, ListItemsFormValues, ListWithItemCount } from '@/server/db/schema';
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
  refetchOnReconnect: false,
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
  onMutate: async ({ listItems }, context) => {
    await context.client.cancelQueries({ queryKey: queryKeys.listItems(listId) })
    // TODO: prevListItems are not optimistically updated, there prev state not needed
    //* handle onSuccess/onError in ListItemsForm to properly set/reset form values
    const prevListItems = context.client.getQueryData(queryKeys.listItems(listId))
    const prevLists = context.client.getQueryData(queryKeys.lists())

    // set items count since lists are not invalidated after saving list items
    context.client.setQueryData(
      queryKeys.lists(),
      (old?: ListWithItemCount[]) => old?.map(list => list.id === listId
        ? { ...list, itemsCount: listItems.length }
        : list
      )
    )

    return { prevListItems, prevLists }
  },
  onError: (_err, _variables, onMutateResult, context) => {
    // TODO: check if this works, maybe mock error
    context.client.setQueryData(queryKeys.listItems(listId), () => onMutateResult?.prevListItems)
    context.client.setQueryData(queryKeys.lists(), () => onMutateResult?.prevLists)
  },
  onSuccess: (_data, _variables, _onMutateResult, context) => {
    context.client.invalidateQueries({ queryKey: queryKeys.listItems(listId) })
  },
})
