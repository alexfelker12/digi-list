import { db } from '@/server/db';
import { ListItem, ListItemInsert, listItems, lists } from '@/server/db/schema';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { count, eq, sql } from 'drizzle-orm';
import { queryKeys } from "./_helper";


// ─── Run list items ───────────────────────────────────────────────────────────
//* listItems from list-item-queries

export const checkedListItemsCountQueryOptions = (listId: number) => queryOptions({
  queryKey: queryKeys.checkedCount(listId),
  queryFn: async () => {
    const [checkedListItemsCount] = await db
      .select({
        total: count(eq(listItems.listId, listId)),
        // count rows where checked is '1' (sqlite boolean '0' / '1')
        checked: count(sql`CASE WHEN ${listItems.checked} = 1 THEN 1 END`),
      })
      .from(listItems)
      .where(eq(listItems.listId, listId))

    return checkedListItemsCount
  },
  placeholderData: (previousData) => previousData,
})

// ─── Run list Mutations ───────────────────────────────────────────────────────────
export const toggleCheckedListItemMutationOptions = (id: number, listId: number) => mutationOptions({
  mutationFn: async (data: Pick<ListItemInsert, "checked">) => {
    const [updatedListItem] = await db.update(listItems)
      .set(data)
      .where(eq(listItems.id, id))
      .returning()

    return updatedListItem
  },
  onMutate: async ({ checked }, context) => {
    await context.client.cancelQueries({ queryKey: queryKeys.listItems(listId) })
    const previous = context.client.getQueryData(queryKeys.listItems(listId))

    // optimistically set checked state
    context.client.setQueryData(
      queryKeys.listItems(listId),
      (old?: ListItem[]) => old?.map(item => item.id === id ? { ...item, checked } : item)
    )

    return { previous }
  },
  onError: (_err, _variables, onMutateResult, context) => {
    context.client.setQueryData(queryKeys.listItems(listId), () => onMutateResult?.previous)
  },
  // onSuccess: (_data, _variables, _onMutateResult, context) => {
  //   context.client.invalidateQueries({ queryKey: queryKeys.listItems(listId) })
  // },
})

export const markListAsCompletedMutationOptions = (id: number) => mutationOptions({
  mutationFn: async () => {
    await db.update(lists)
      .set({ completedOnce: true })
      .where(eq(lists.id, id))
  },
})

export const resetListMutationOptions = (id: number) => mutationOptions({
  mutationFn: async () => {
    await db.transaction(async (tx) => {
      await tx.update(lists)
        .set({ completedOnce: false })
        .where(eq(lists.id, id))

      await tx.update(listItems)
        .set({ checked: false })
        .where(eq(listItems.listId, id))
    })
  },
})
