import { db } from '@/server/db';
import { ListItemInsert, listItems } from '@/server/db/schema';
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
export const toggleCheckedListItemMutationOptions = (id: number) => mutationOptions({
  mutationFn: async (data: Pick<ListItemInsert, "checked">) => {
    const [updatedListItem] = await db.update(listItems)
      .set(data)
      .where(eq(listItems.id, id))
      .returning()

    return updatedListItem
  },
})

export const resetListMutationOptions = (id: number) => mutationOptions({
  mutationFn: async () => {
    await db.update(listItems)
      .set({ checked: false })
      .where(eq(listItems.listId, id))
  },
})
