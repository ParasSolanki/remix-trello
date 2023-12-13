CREATE TABLE `board_lists` (
	`id` varchar(24) NOT NULL,
	`name` varchar(255) NOT NULL,
	`order` int NOT NULL,
	`board_id` varchar(24) NOT NULL,
	`created_by_id` varchar(24) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `board_lists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `board_lists_order_idx` ON `board_lists` (`order`);--> statement-breakpoint
CREATE INDEX `board_lists_board_idx` ON `board_lists` (`board_id`);--> statement-breakpoint
CREATE INDEX `board_lists_created_by_idx` ON `board_lists` (`created_by_id`);--> statement-breakpoint
CREATE INDEX `board_lists_created_at_idx` ON `board_lists` (`created_at`);--> statement-breakpoint
ALTER TABLE `board_lists` ADD CONSTRAINT `board_lists_board_id_boards_id_fk` FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `board_lists` ADD CONSTRAINT `board_lists_created_by_id_users_id_fk` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;