CREATE TABLE `list_cards` (
	`id` varchar(24) NOT NULL,
	`name` varchar(255) NOT NULL,
	`order` int NOT NULL,
	`description` text,
	`board_list_id` varchar(24) NOT NULL,
	`created_by_id` varchar(24) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `list_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `list_cards_order_idx` ON `list_cards` (`order`);--> statement-breakpoint
CREATE INDEX `list_cards_board_list_idx` ON `list_cards` (`board_list_id`);--> statement-breakpoint
CREATE INDEX `list_cards_created_by_idx` ON `list_cards` (`created_by_id`);--> statement-breakpoint
CREATE INDEX `list_cards_created_at_idx` ON `list_cards` (`created_at`);--> statement-breakpoint
ALTER TABLE `list_cards` ADD CONSTRAINT `list_cards_board_list_id_board_lists_id_fk` FOREIGN KEY (`board_list_id`) REFERENCES `board_lists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `list_cards` ADD CONSTRAINT `list_cards_created_by_id_users_id_fk` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;