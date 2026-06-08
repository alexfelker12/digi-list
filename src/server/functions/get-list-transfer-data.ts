import { TransferPayload } from "@/lib/transfer/tcp-transfer"
import { eq } from "drizzle-orm"
import { db, lists } from "../db"
import { getListItemsByListId } from "./get-list-items-by-list-id"

export async function getListTransferData(listId: number): Promise<TransferPayload | undefined> {
  // ---
  const [listToTransfer] = await db.select()
    .from(lists)
    .where(eq(lists.id, listId))

  if (!listToTransfer) return

  // ---
  const listItemsByListId = await getListItemsByListId(listId)

  return {
    ...listToTransfer,
    listItems: listItemsByListId
  }
}
