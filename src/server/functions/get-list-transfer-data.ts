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

  // TODO: list transfer
  /** steps
   * 1. save list
   * 2. save items
   * 3. create images from items
   * 4. create listItem, each linked to list and it's respective item
   */
  /** needed for transfer data
   * 1. list
   * 2. listItems with item
   * 3. mapping object linking
   */
  /** technical process of saving transfer data
   * 1. create list from transfered list data
   * 1.1 save id from created list to const (const newListId = newList.id)
   * 2. iterate thorugh listItemsByListId:
   * 2.1 create item with listItem.list data (const newItemId = newItem.id)
   * 2.2 create listItem with listId = newListId & itemId = newItemId
   * 2.3 map listItem.list.id to newItemId
   * TODO: think about how to transfer images and correctly map created image filename to newly created items
   * 3. save images to receiver device and update items with new 
   * 
   */
}
