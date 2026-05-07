import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from "zod/v4";

export const lists = sqliteTable('list', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const items = sqliteTable('item', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  quantity: real('quantity').notNull(),
  unit: text('unit', { enum: ['kg', 'g', 'l', 'ml', 'stk', 'pkg', 'el', 'tl'] }).notNull(),
  notes: text('notes'),
  imageUris: text('image_uris'),
}, (t) => [
  index('items_name_idx').on(t.name),
]);

// Items sind zunächst listenunabhängig — Zuordnung über list_items
export const listItems = sqliteTable('list_item', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listId: integer('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
  itemId: integer('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),
  checked: integer('checked', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => [
  index('list_items_list_idx').on(t.listId),
  index('list_items_item_idx').on(t.itemId),
]);

export type List = typeof lists.$inferSelect;
export type NewList = typeof lists.$inferInsert;
export type Item = typeof items.$inferSelect;
export type ItemWithUriArray = Omit<Item, 'imageUris'> & { imageUris: string[] }
export type NewItem = typeof items.$inferInsert;
export type ListItem = typeof listItems.$inferSelect;
export type Unit = Item['unit'];
export const UNITS: Unit[] = ['kg', 'g', 'l', 'ml', 'stk', 'pkg', 'el', 'tl'];

export const parseImageUris = (raw: string | null | undefined): string[] => {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
};
export const stringifyImageUris = (uris: string[]): string => JSON.stringify(uris);

export const itemInsertSchema = createInsertSchema(items, {
  // Felder überschreiben oder mit Validierung versehen
  name: z.string()
    .min(1, "Bitte Name des Produkts angeben")
    .max(100, "Nicht mehr als 100 Zeichen erlaubt"),
  quantity: z.number({
    error: (issue) => {
      if (issue.code === "invalid_type") return "Bitte Menge angeben"
    }
  })
    .min(0, "Bitte Menge angeben")
    .nonoptional(),
  unit: z.enum(UNITS, "Bitte Einheit angeben")
    .nonoptional(),
  notes: z.string()
    .max(500, "Nicht mehr als 500 Zeichen erlaubt")
    .nullable(),

  // imageUris als Array statt String — wir parsen es im Formular
  imageUris: z.array(z.string()).optional(),
});

export type ItemFormInput = Omit<ItemFormValues, 'quantity' | 'unit'> & {
  quantity: number | null;
  unit: Unit | null;
};
export type ItemFormValues = z.output<typeof itemInsertSchema>;

export const unitMap: Record<Unit, string> = {
  kg: 'Kilogramm',
  g: 'Gramm',
  l: 'Liter',
  ml: 'Milliliter',
  stk: 'Stück',
  pkg: 'Packung',
  el: 'Esslöffel',
  tl: 'Teelöffel'
}
