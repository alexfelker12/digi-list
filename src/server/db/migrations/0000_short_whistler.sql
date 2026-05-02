CREATE TABLE `item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`list_id` integer NOT NULL,
	`name` text NOT NULL,
	`quantity` real,
	`unit` text,
	`description` text,
	`notes` text,
	`image_uris` text,
	`alt_name` text,
	`alt_notes` text,
	`checked` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `list`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `items_list_idx` ON `item` (`list_id`);--> statement-breakpoint
CREATE TABLE `list` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
