import { db } from "~/server/db";
import {
  files as fileSchema,
  folders as folderSchema,
} from "~/server/db/schema";
import DriveContents from "../../drive-contents";
import { z } from "zod";
import { eq } from "drizzle-orm";

export default async function GoogleDriveClone(props: {
  params: Promise<{ folderId: string }>;
}) {
  const params = await props.params;
  // NOTE: We changed typeof folderId from number to string to make sure that we can parse it intot int
  const parsedFolderId = parseInt(params.folderId);
  if (isNaN(parsedFolderId)) {
    return <div> Invalid folder ID </div>;
  }
  const files = await db
    .select()
    .from(fileSchema)
    .where(eq(fileSchema.parent, parsedFolderId));
  const folders = await db
    // NOTE: SQL query -> select * from folderSchema where parent == parsedFolderId
    .select()
    .from(folderSchema)
    // eq = equal
    .where(eq(folderSchema.parent, parsedFolderId));
  return <DriveContents files={files} folders={folders}></DriveContents>;
}
