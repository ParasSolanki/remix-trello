CREATE TABLE `boards` (
	`id` varchar(24) NOT NULL,
	`name` varchar(255) NOT NULL,
	`banner_image_url` text,
	`organization_id` varchar(24) NOT NULL,
	`created_by_id` varchar(24) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `boards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `boards_created_by_idx` ON `boards` (`created_by_id`);--> statement-breakpoint
CREATE INDEX `boards_created_at_idx` ON `boards` (`created_at`);--> statement-breakpoint
CREATE INDEX `boards_organization_idx` ON `boards` (`organization_id`);--> statement-breakpoint
ALTER TABLE `boards` ADD CONSTRAINT `boards_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boards` ADD CONSTRAINT `boards_created_by_id_users_id_fk` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;