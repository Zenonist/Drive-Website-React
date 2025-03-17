import { auth } from "@clerk/nextjs/server";
import { mockFolders } from "~/lib/mock-data";
import { db } from "~/server/db";
import { folders_table } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { QUERIES } from "~/server/db/queries";

export default async function Sandbox() {
  const user = await auth();
  if (!user.userId) {
    throw new Error("Unauthorized");
  }
  // const folders = await db
  //   .select()
  //   .from(folders_table)
  //   .where(eq(folders_table.ownerId, user.userId));

  // console.log("folders", folders);
  return (
    <div>
      <div>
        <form
          action={async () => {
            "use server";
            const user = await auth();
            if (!user.userId) {
              throw new Error("Unauthorized");
            }
            const rootFolder = await db
              .insert(folders_table)
              .values({
                name: "root",
                ownerId: user.userId,
                parent: null,
              })
              .$returningId();

            const insertableFolders = mockFolders.map((folder) => ({
              name: folder.name,
              ownerId: user.userId,
              parent: rootFolder[0]!.id,
            }));

            await db.insert(folders_table).values(insertableFolders);

            console.log("Insert folders");

            // const insertableFiles = mockFiles.map(file => ({
            //     name: file.name,
            //     ownerId: user.userId,
            //     parent: file.parent,
            //     size: file.size,
            //     url: file.url
            // }))

            // await db.insert(files_table).values(insertableFiles)

            // console.log("Insert files")
          }}
        >
          <button type="submit">Create file</button>
        </form>
      </div>
      <div>
        <form
          action={async () => {
            "use server";
            const user = await auth();
            if (!user.userId) {
              throw new Error("Unauthorized");
            }
            console.log("A")
            const rootFolder = await QUERIES.getRootFolderForUser(
              user.userId,
            );
            console.log(rootFolder)
            if (rootFolder) {
              console.log("B")
              QUERIES.getFilesAndFoldersByFolderId(rootFolder.id);
            }
          }}
        >
          <button type="submit">Get folder list</button>
        </form>
      </div>
    </div>
  );
}
