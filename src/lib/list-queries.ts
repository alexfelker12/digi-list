// hooks/use-list-query.ts
import { db, items, lists } from '@/server/db';
import { mutationOptions, queryOptions, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';


export const listKeys = {
  all: ['lists'] as const,
  detail: (id: number) => ['lists', id] as const,
  items: (id: number) => ['lists', id, 'items'] as const,
}

export const listsQueryOptions = () => {
  return queryOptions({
    queryKey: listKeys.all,
    queryFn: () => {
      return db.select()
        .from(lists)
        .orderBy(lists.createdAt)
    }
  });
}

export const listItemsQueryOptions = (listId: number) => {
  return queryOptions({
    queryKey: listKeys.items(listId),
    queryFn: () => {
      return db.select()
        .from(items)
        .where(eq(items.listId, listId))
        .orderBy(items.sortOrder)
    }
  });
}

export const checkItemMutationOptions = (listId: number) => {
  const qc = useQueryClient()
  return mutationOptions({
    mutationFn: ({ itemId, checked }: { itemId: number; checked: boolean }) => {
      return db.update(items)
        .set({ checked })
        .where(eq(items.id, itemId))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: listKeys.items(listId) });
    },
  });
}

export const resetListMutationOptions = (listId: number) => {
  const qc = useQueryClient()
  return mutationOptions({
    mutationFn: () => {
      return db.update(items)
        .set({ checked: false })
        .where(eq(items.listId, listId))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: listKeys.items(listId) });
    },
  });
}

export const deleteListMutationOptions = (listId: number) => {
  const qc = useQueryClient()
  return mutationOptions({
    mutationFn: () => {
      return db.delete(lists)
        .where(eq(lists.id, listId))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: listKeys.all });
    },
  });
}
