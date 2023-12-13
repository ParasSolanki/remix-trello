CREATE TABLE `user_keys` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(24) NOT NULL,
	`hashed_password` varchar(255),
	CONSTRAINT `user_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(24) NOT NULL,
	`active_expires` bigint NOT NULL,
	`idle_expires` bigint NOT NULL,
	CONSTRAINT `user_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(24) NOT NULL,
	`email` varchar(255) NOT NULL,
	`display_name` varchar(255),
	`avatar_url` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `user_keys_user_idx` ON `user_keys` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_sessions_user_idx` ON `user_sessions` (`user_id`);--> statement-breakpoint
ALTER TABLE `user_keys` ADD CONSTRAINT `user_keys_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_sessions` ADD CONSTRAINT `user_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;