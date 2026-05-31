import { TransferPayload } from "@/lib/transfer/tcp-transfer";
import { eq } from "drizzle-orm";
import { db, items, List, listItems, lists, stringifyImageUris } from "../db";

export type DuplicateResolution = "keep" | "replace"

export async function saveTransferedList(
  data: TransferPayload,
  //* for now, always update imageUris from duplicate items
  duplicateResolution: DuplicateResolution = "replace"
): Promise<List | undefined> {
  return await db.transaction(async (tx) => {
    const { listItems: listItemsWithItem, ...list } = data

    const [newList] = await tx.insert(lists)
      .values({ name: list.name })
      .returning()

    for (const listItem of listItemsWithItem) {
      const item = listItem.item

      // check if item with same name already exists
      const [existingItem] = await tx.select()
        .from(items)
        .where(eq(items.name, item.name))
        .limit(1)

      let itemId: number

      if (existingItem) {
        console.log("[save] duplicate item found:", item.name, "resolution:", duplicateResolution)

        if (duplicateResolution === "replace") {
          // update imageUris of existing item with incoming data
          await tx.update(items)
            .set({ imageUris: stringifyImageUris(item.imageUris) })
            .where(eq(items.id, existingItem.id))
        }
        // reference the existing item
        itemId = existingItem.id
      } else {
        const [newItem] = await tx.insert(items)
          .values({
            name: item.name,
            imageUris: stringifyImageUris(item.imageUris)
          })
          .returning()

        console.log("[save] new item created:", item.name)
        itemId = newItem.id
      }

      await tx.insert(listItems)
        .values({
          listId: newList.id,
          itemId,
          quantity: listItem.quantity,
          unit: listItem.unit,
          notes: listItem.notes,
          sortOrder: listItem.sortOrder,
        })
    }

    return newList
  })
}
