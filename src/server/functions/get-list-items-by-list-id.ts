import { parseItem } from "@/lib/queries/_helper"
import { eq } from "drizzle-orm"
import { db, items, listItems } from "../db"


export async function getListItemsByListId(listId: number) {
  const listItemsByListId = await db.select({
    id: listItems.id,
    listId: listItems.listId,
    itemId: listItems.itemId,
    quantity: listItems.quantity,
    unit: listItems.unit,
    notes: listItems.notes,
    checked: listItems.checked,
    sortOrder: listItems.sortOrder,

    item: {
      id: items.id,
      name: items.name,
      imageUris: items.imageUris,
    }
  })
    .from(listItems)
    .innerJoin(items, eq(listItems.itemId, items.id))
    .where(eq(listItems.listId, listId))
    .orderBy(listItems.sortOrder)

  const parsedListItemsByListId = listItemsByListId.map(({ item, ...rest }) => ({
    ...rest,
    item: parseItem(item)
  }))

  return parsedListItemsByListId
}
