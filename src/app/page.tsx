import { db } from "~/server/db";
import { files as fileScehema, folders as folderSchema} from "~/server/db/schema";
import DriveContents from "./drive-contents";


export default async function GoogleDriveClone() {
  const files = await db.select().from(fileScehema);
  const folders = await db.select().from(folderSchema);
  return <DriveContents files={files} folders={folders}></DriveContents>
}

