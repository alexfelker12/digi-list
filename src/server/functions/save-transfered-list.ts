import { resolveListName, TransferPayload } from "@/lib/transfer/tcp-transfer";
import { ensureImagesDir, getImageFile } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { db, items, List, listItems, lists, stringifyImageUris } from "../db";


export type DuplicateResolution = "keep" | "replace"

export async function saveTransferedList(
  data: TransferPayload,
  images: { filename: string; bytes: Uint8Array }[],
  duplicateResolution: DuplicateResolution = "replace"
): Promise<List | undefined> {
  // write images to filesystem first, outside transaction
  ensureImagesDir()
  for (const { filename, bytes } of images) {
    const file = getImageFile(filename)
    if (!file.exists) {
      file.write(bytes)
      console.log("[save] wrote image:", filename, bytes.length, "bytes")
    } else {
      console.log("[save] image already exists, skipping:", filename)
    }
  }

  return await db.transaction(async (tx) => {
    const { listItems: listItemsWithItem, ...list } = data

    // resolve list name 
    const existingLists = await tx.select({ name: lists.name }).from(lists)
    const existingNames = existingLists.map(({ name }) => name)
    const resolvedName = resolveListName(list.name, existingNames)

    const [newList] = await tx.insert(lists)
      .values({ name: resolvedName })
      .returning()

    for (const listItem of listItemsWithItem) {
      const item = listItem.item

      const [existingItem] = await tx.select()
        .from(items)
        .where(eq(items.name, item.name))
        .limit(1)

      let itemId: number

      if (existingItem) {
        console.log("[save] duplicate item:", item.name, "resolution:", duplicateResolution)
        if (duplicateResolution === "replace") {
          await tx.update(items)
            .set({ imageUris: stringifyImageUris(item.imageUris) })
            .where(eq(items.id, existingItem.id))
        }
        itemId = existingItem.id
      } else {
        const [newItem] = await tx.insert(items)
          .values({
            name: item.name,
            imageUris: stringifyImageUris(item.imageUris)
          })
          .returning()
        console.log("[save] new item:", item.name)
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
