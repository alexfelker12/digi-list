import { TransferPayload } from "@/lib/transfer/tcp-transfer";
import { db, items, List, listItems, lists, stringifyImageUris } from "../db";


export async function saveTransferedList(data: TransferPayload): Promise<List | undefined> {
  return await db.transaction(async (tx) => {
    const { listItems: listItemsWithItem, ...list } = data

    const [newList] = await tx.insert(lists)
      .values({ name: list.name })
      .returning()

    for (const listItem of listItemsWithItem) {
      const item = listItem.item

      const [newItem] = await tx.insert(items)
        .values({
          name: item.name,
          imageUris: stringifyImageUris(item.imageUris)
        })
        .returning()

      await tx.insert(listItems)
        .values({
          listId: newList.id,
          itemId: newItem.id,
          quantity: listItem.quantity,
          unit: listItem.unit,
          notes: listItem.notes,
          sortOrder: listItem.sortOrder,
        })
    }

    return newList
  })
}