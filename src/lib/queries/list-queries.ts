import { db } from '@/server/db';
import { lists } from '@/server/db/schema';
import { mutationOptions, queryOptions, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import { queryKeys } from "./_helper";


// ─── Lists ───────────────────────────────────────────────────────────
export const allListsQueryOptions = () => queryOptions({
  queryKey: queryKeys.lists(),
  queryFn: async () => {
    const rows = await db.select().from(lists);
    return rows
  },
});

export const createListMutationOptions = () => {
  const qc = useQueryClient();
  return mutationOptions({
    mutationFn: async ({ name }: { name: string }) => {
      const [created] = await db.insert(lists)
        .values({ name })
        .returning();
      return created;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.lists() }),
  });
}

export const deleteListMutationOptions = (id: number) => {
  const qc = useQueryClient();
  return mutationOptions({
    mutationFn: () => db.delete(lists).where(eq(lists.id, id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.lists() }),
  });
}
