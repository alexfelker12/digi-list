import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';


export const lists = sqliteTable('list', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const items = sqliteTable('item', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listId: integer('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  quantity: real('quantity'),
  unit: text('unit', { enum: ['kg', 'g', 'l', 'ml', 'Stk', 'Pkg', 'EL', 'TL'] }),
  description: text('description'),
  notes: text('notes'),
  imageUris: text('image_uris'),
  altName: text('alt_name'),
  altNotes: text('alt_notes'),
  checked: integer('checked', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => ([
  index('items_list_idx').on(t.listId),
]));

// Typen
export type List = typeof lists.$inferSelect;
export type NewList = typeof lists.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type Unit = NonNullable<Item['unit']>;

// Hilfsfunktion für imageUris
export const parseImageUris = (raw: string | null): string[] => {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
};

export const stringifyImageUris = (uris: string[]): string =>
  JSON.stringify(uris);
