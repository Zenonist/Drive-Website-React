import { db } from "~/server/db";
import {
  files_table as fileSchema,
  folders_table as folderSchema,
} from "~/server/db/schema";
import DriveContents from "../../drive-contents";
import { eq } from "drizzle-orm";

/**
 * Retrieves all parent folders for a given folder in a hierarchical order.
 * 
 * This function traverses up the folder hierarchy starting from the specified
 * folder ID, collecting all parent folders until it reaches the root folder
 * (which has null as parent).
 * 
 * @async
 * @param {number} folderId - The ID of the folder to get parents for
 * @returns {Promise<Array<Folder>>} An array of parent folders ordered from the direct parent to the root
 * @throws {Error} Throws an error if a parent folder is not found in the database
 */
async function getAllParents(folderId: number) {
  const parents = [];
  let currentFolderId: number | null = folderId;
  while (currentFolderId !== null) {
    const folder = await db
      .selectDistinct()
      .from(folderSchema)
      .where(eq(folderSchema.id, currentFolderId)
    );
    if (!folder || folder.length === 0) {
      throw new Error("parent folder not found");
    }
    // Reverse the order of the parents array -> This will make the correct order of the directory or path
    if (folder[0]?.id !== 1) {
      parents.unshift(folder[0]);
    }
    currentFolderId = folder[0]?.parent ?? null;
  }
  return parents;
}

export default async function GoogleDriveClone(props: {
  params: Promise<{ folderId: string }>;
}) {
  const params = await props.params;
  // NOTE: We changed typeof folderId from number to string to make sure that we can parse it intot int
  const parsedFolderId = parseInt(params.folderId);
  if (isNaN(parsedFolderId)) {
    return <div> Invalid folder ID </div>;
  }
  
  const foldersPromise = db
    // NOTE: SQL query -> select * from folderSchema where parent == parsedFolderId
    .select()
    .from(folderSchema)
    // eq = equal
    .where(eq(folderSchema.parent, parsedFolderId));
  
  const filesPromise = db
    .select()
    .from(fileSchema)
    .where(eq(fileSchema.parent, parsedFolderId));

  const parentsPromise = getAllParents(parsedFolderId);
  
  const [folders, files, parents] = await Promise.all([foldersPromise, filesPromise, parentsPromise]);

  return <DriveContents files={files} folders={folders} parents={parents.filter(Boolean)}></DriveContents>;
}
