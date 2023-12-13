CREATE TABLE `organization_members` (
	`id` varchar(24) NOT NULL,
	`organization_id` varchar(24) NOT NULL,
	`member_id` varchar(24) NOT NULL,
	`member_role_id` varchar(24) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `organization_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `organization_members_organization_idx` ON `organization_members` (`organization_id`);--> statement-breakpoint
ALTER TABLE `organization_members` ADD CONSTRAINT `organization_members_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organization_members` ADD CONSTRAINT `organization_members_member_id_users_id_fk` FOREIGN KEY (`member_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organization_members` ADD CONSTRAINT `organization_members_member_role_id_organization_roles_id_fk` FOREIGN KEY (`member_role_id`) REFERENCES `organization_roles`(`id`) ON DELETE no action ON UPDATE no action;