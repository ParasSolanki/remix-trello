CREATE TABLE `organization_invitations` (
	`id` varchar(24) NOT NULL,
	`organization_id` varchar(24) NOT NULL,
	`email` varchar(24) NOT NULL,
	`member_role_id` varchar(24) NOT NULL,
	`expires_at` timestamp DEFAULT (now()),
	CONSTRAINT `organization_invitations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `organization_invitations_organization_idx` ON `organization_invitations` (`organization_id`);--> statement-breakpoint
ALTER TABLE `organization_invitations` ADD CONSTRAINT `organization_invitations_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organization_invitations` ADD CONSTRAINT `organization_invitations_member_role_id_organization_roles_id_fk` FOREIGN KEY (`member_role_id`) REFERENCES `organization_roles`(`id`) ON DELETE no action ON UPDATE no action;