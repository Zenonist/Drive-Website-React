import "server-only";

import { int, text, index, singlestoreTableCreator, bigint } from "drizzle-orm/singlestore-core";

// NOTE: This helps to avoid table name collisions with other application by prefixing the table name with the application name.
export const createTable = singlestoreTableCreator(
  (name) => `GoogleDriveClone_${name}`
)

export const files_table = createTable("files_table", {
  id : bigint({mode: "number", unsigned: true}).primaryKey().autoincrement(),
  name: text("name").notNull(),
  size: int("size").notNull(),
  url: text("url").notNull(),
  parent: bigint("parent", {mode: "number", unsigned: true}).notNull(),
}, (t) => {
  return [
    index("parent_index").on(t.parent)
  ]
})

export const folders_table = createTable("folders_table", {
  id : bigint({mode: "number", unsigned: true}).primaryKey().autoincrement(),
  name: text("name").notNull(),
  parent: int("parent"),
}, (t) => {
  return [
    index("parent_index").on(t.parent)
  ]
})

// *NOTE - Remove users table because does not use it