import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import {
  bigint,
  index,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

const CUID2_LENGTH = 24;

export const users = mysqlTable("users", {
  id: varchar("id", { length: CUID2_LENGTH })
    .$defaultFn(() => createId())
    .primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").default(
    sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`,
  ),
});

export const userSessions = mysqlTable(
  "user_sessions",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    userId: varchar("user_id", { length: CUID2_LENGTH })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    activeExpires: bigint("active_expires", {
      mode: "number",
    }).notNull(),
    idleExpires: bigint("idle_expires", {
      mode: "number",
    }).notNull(),
  },
  (table) => ({
    userIdx: index("user_sessions_user_idx").on(table.userId),
  }),
);

export const userKeys = mysqlTable(
  "user_keys",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: CUID2_LENGTH })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    hashedPassword: varchar("hashed_password", {
      length: 255,
    }),
  },
  (table) => ({
    userIdx: index("user_keys_user_idx").on(table.userId),
  }),
);

export const organizations = mysqlTable(
  "organizations",
  {
    id: varchar("id", { length: CUID2_LENGTH })
      .$defaultFn(() => createId())
      .primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    logoUrl: text("logo_url"),
    ownerId: varchar("owner_id", { length: CUID2_LENGTH })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").default(
      sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`,
    ),
  },
  (table) => ({
    ownderIdx: index("organizations_owner_idx").on(table.ownerId),
  }),
);

export const organizationRoles = mysqlTable("organization_roles", {
  id: varchar("id", { length: CUID2_LENGTH })
    .$defaultFn(() => createId())
    .primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  organizationId: varchar("organization_id", { length: CUID2_LENGTH })
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").default(
    sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`,
  ),
});

export const organizationInvitations = mysqlTable(
  "organization_invitations",
  {
    id: varchar("id", { length: CUID2_LENGTH })
      .$defaultFn(() => createId())
      .primaryKey(),
    organizationId: varchar("organization_id", { length: CUID2_LENGTH })
      .notNull()
      .references(() => organizations.id),
    email: varchar("email", { length: CUID2_LENGTH }).notNull(),
    memberRoleId: varchar("member_role_id", { length: CUID2_LENGTH })
      .notNull()
      .references(() => organizationRoles.id),
    expiresAt: timestamp("expires_at").defaultNow(),
  },
  (table) => ({
    organizationIdx: index("organization_invitations_organization_idx").on(
      table.organizationId,
    ),
  }),
);

export const organizationMembers = mysqlTable(
  "organization_members",
  {
    id: varchar("id", { length: CUID2_LENGTH })
      .$defaultFn(() => createId())
      .primaryKey(),
    organizationId: varchar("organization_id", { length: CUID2_LENGTH })
      .notNull()
      .references(() => organizations.id),
    memberId: varchar("member_id", { length: CUID2_LENGTH })
      .notNull()
      .references(() => users.id),
    memberRoleId: varchar("member_role_id", { length: CUID2_LENGTH })
      .notNull()
      .references(() => organizationRoles.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").default(
      sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`,
    ),
  },
  (table) => ({
    organizationIdx: index("organization_members_organization_idx").on(
      table.organizationId,
    ),
  }),
);

export const boards = mysqlTable(
  "boards",
  {
    id: varchar("id", { length: CUID2_LENGTH })
      .$defaultFn(() => createId())
      .primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    bannerImageUrl: text("banner_image_url"),
    organizationId: varchar("organization_id", { length: CUID2_LENGTH })
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    createdById: varchar("created_by_id", { length: CUID2_LENGTH })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").default(
      sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`,
    ),
  },
  (table) => ({
    createdByIdx: index("boards_created_by_idx").on(table.createdById),
    createdAtIdx: index("boards_created_at_idx").on(table.createdAt),
    organizationIdx: index("boards_organization_idx").on(table.organizationId),
  }),
);

export const boardLists = mysqlTable(
  "board_lists",
  {
    id: varchar("id", { length: CUID2_LENGTH })
      .$defaultFn(() => createId())
      .primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    order: int("order").notNull(),
    boardId: varchar("board_id", { length: CUID2_LENGTH })
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    createdById: varchar("created_by_id", { length: CUID2_LENGTH })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").default(
      sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`,
    ),
  },
  (table) => ({
    orderIdx: index("board_lists_order_idx").on(table.order),
    boardIdx: index("board_lists_board_idx").on(table.boardId),
    createdByIdx: index("board_lists_created_by_idx").on(table.createdById),
    createdAtIdx: index("board_lists_created_at_idx").on(table.createdAt),
  }),
);

export const listCards = mysqlTable(
  "list_cards",
  {
    id: varchar("id", { length: CUID2_LENGTH })
      .$defaultFn(() => createId())
      .primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    order: int("order").notNull(),
    description: text("description"),
    boardListId: varchar("board_list_id", { length: CUID2_LENGTH })
      .notNull()
      .references(() => boardLists.id, { onDelete: "cascade" }),
    createdById: varchar("created_by_id", { length: CUID2_LENGTH })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").default(
      sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`,
    ),
  },
  (table) => ({
    orderIdx: index("list_cards_order_idx").on(table.order),
    boardListIdx: index("list_cards_board_list_idx").on(table.boardListId),
    createdByIdx: index("list_cards_created_by_idx").on(table.createdById),
    createdAtIdx: index("list_cards_created_at_idx").on(table.createdAt),
  }),
);
