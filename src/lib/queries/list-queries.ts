import { db } from '@/server/db';
import { ListFormValues, listItems, lists } from '@/server/db/schema';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { count, desc, eq } from 'drizzle-orm';
import { queryKeys } from "./_helper";


// ─── Lists ───────────────────────────────────────────────────────────
export const allListsQueryOptions = () => queryOptions({
  queryKey: queryKeys.lists(),
  queryFn: async () => {
    const rows = await db.select({
      id: lists.id,
      createdAt: lists.createdAt,
      name: lists.name,
      completedOnce: lists.completedOnce,
      itemsCount: count(eq(lists.id, listItems.listId))
    })
      .from(lists)
      .leftJoin(listItems, eq(lists.id, listItems.listId))
      .groupBy(lists.id) //* group keeps lists with 0 items, without groupBy these would 
      .orderBy(desc(lists.createdAt))

    return rows
  },
})

export const createListMutationOptions = () => mutationOptions({
  mutationFn: async ({ name }: { name: string }) => {
    const [created] = await db.insert(lists)
      .values({ name })
      .returning()
    return created
  },
  onSuccess: (_data, _variables, _onMutateResult, context) => {
    context.client.invalidateQueries({ queryKey: queryKeys.lists() })
  },
})


export const updateListMutationOptions = () => mutationOptions({
  mutationFn: async ({ listId, data }: { listId: number, data: ListFormValues }) => {
    const [updated] = await db.update(lists)
      .set(data)
      .where(eq(lists.id, listId))
      .returning()
    return updated
  },
  onSuccess: (_data, _variables, _onMutateResult, context) => {
    context.client.invalidateQueries({ queryKey: queryKeys.lists() })
  },
})

export const deleteListMutationOptions = () => mutationOptions({
  mutationFn: async ({ listId }: { listId: number }) => {
    await db.delete(lists).where(eq(lists.id, listId))
  },
  onSuccess: (_data, _variables, _onMutateResult, context) => {
    context.client.invalidateQueries({ queryKey: queryKeys.lists() })
  },
})
