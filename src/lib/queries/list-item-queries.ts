import { db } from '@/server/db';
import { ListItemFormValues, listItems } from '@/server/db/schema';
import { mutationOptions, queryOptions, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import { queryKeys } from "./_helper";


// ─── List items ───────────────────────────────────────────────────────────
export const listItemsQueryOptions = (listId: number) => queryOptions({
  queryKey: queryKeys.listItems(listId),
  queryFn: async () => {
    const listItemsByListId = await db.select()
      .from(listItems)
      .where(eq(listItems.listId, listId))
      .orderBy(listItems.sortOrder)
    return listItemsByListId
  },
});


// ─── List item Mutations ───────────────────────────────────────────────────────────
export const updateListItemsMutationOptions = (listId: number) => {
  const qc = useQueryClient();
  return mutationOptions({
    mutationFn: async (data: ListItemFormValues[]) => {
      const updatedListItems = await db.transaction(async (tx) => {
        // delete all list items
        await tx.delete(listItems).where(eq(listItems.id, listId))

        // recreate with updated values
        const listItemsWithoutIds = data.map(({ id, listId: maybeIncorrectListId, ...rest }) => ({ ...rest, listId }))
        const [updatedListItems] = await tx.insert(listItems)
          .values(listItemsWithoutIds)
          .returning()

        return updatedListItems
      })

      return updatedListItems
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.listItems(listId) }),
  });
}

export const toggleCheckedListItemMutationOptions = (id: number) => {
  const qc = useQueryClient();
  return mutationOptions({
    mutationFn: async (data: Pick<ListItemFormValues, "checked">) => {
      const [updatedListItem] = await db.update(listItems)
        .set(data)
        .where(eq(listItems.id, id))
        .returning()

      return updatedListItem
    },
    // TODO: check if query invalidation is needed
    // onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.listItems(listId) }),
  });
}
