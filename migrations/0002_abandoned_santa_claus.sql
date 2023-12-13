CREATE TABLE `organization_roles` (
	`id` varchar(24) NOT NULL,
	`name` varchar(255) NOT NULL,
	`organization_id` varchar(24) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `organization_roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `organization_roles` ADD CONSTRAINT `organization_roles_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;