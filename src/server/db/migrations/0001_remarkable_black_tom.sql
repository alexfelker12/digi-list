CREATE TABLE `list_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`list_id` integer NOT NULL,
	`item_id` integer NOT NULL,
	`checked` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `list`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `list_items_list_idx` ON `list_item` (`list_id`);--> statement-breakpoint
CREATE INDEX `list_items_item_idx` ON `list_item` (`item_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`quantity` real,
	`unit` text,
	`description` text,
	`notes` text,
	`image_uris` text,
	`alt_name` text,
	`alt_notes` text,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_item`("id", "name", "quantity", "unit", "description", "notes", "image_uris", "alt_name", "alt_notes", "sort_order") SELECT "id", "name", "quantity", "unit", "description", "notes", "image_uris", "alt_name", "alt_notes", "sort_order" FROM `item`;--> statement-breakpoint
DROP TABLE `item`;--> statement-breakpoint
ALTER TABLE `__new_item` RENAME TO `item`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `items_name_idx` ON `item` (`name`);