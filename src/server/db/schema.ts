// import "server-only";

import { int, text, index, singlestoreTableCreator, bigint, timestamp } from "drizzle-orm/singlestore-core";

// NOTE: This helps to avoid table name collisions with other application by prefixing the table name with the application name.
export const createTable = singlestoreTableCreator(
  (name) => `GoogleDriveClone_${name}`
)

export const files_table = createTable("files_table", {
  id: bigint({ mode: "number", unsigned: true }).primaryKey().autoincrement(),
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull(),
  size: int("size").notNull(),
  url: text("url").notNull(),
  parent: bigint("parent", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => {
  return [
    index("parent_index").on(t.parent),
    index("owner_id_index").on(t.ownerId)
  ]
})

// 
// $inferSelect infers the TypeScript type from the table schema
// This creates a type that represents the shape of records when selected from the database
// Example: DB_FileType will be equivalent to:
// {
//   id: number;
//   name: string;
//   size: number;
//   url: string;
//   parent: number;
// }
export type DB_FileType = typeof files_table.$inferSelect;

export const folders_table = createTable("folders_table", {
  id: bigint({ mode: "number", unsigned: true }).primaryKey().autoincrement(),
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull(),
  parent: bigint("parent", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => {
  return [
    index("parent_index").on(t.parent),
    index("owner_id_index").on(t.ownerId)
  ]
})

export type DB_FolderType = typeof folders_table.$inferSelect;

// *NOTE - Remove users table because does not use it