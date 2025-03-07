import { files, folders } from "~/server/db/schema";
import { db } from "~/server/db";
import { mockFiles, mockFolders } from "~/lib/mock-data";

export default function SandboxPage() {
  return (
    <div className="flex flex-col gap-4">
      Seed Function{" "}
      <form
        action={async () => {
            // NOTE: "use server" is a special directive that marks a function as a server action. Client will see the action of this one.
            "use server";

            const folderInsert = await db.insert(folders).values(mockFolders.map((folder, index) => ({
                id: index + 1,
                name: folder.name,
                parent: index !== 0 ? 1: null,
            })));
            const fileInsert = await db.insert(files).values(mockFiles.map((file, index) => ({
                id: index + 1,
                name: file.name,
                size: 5000,
                url: file.url,
                parent: (index % 3) + 1,
            })));
        }}
      >
        <button type="submit">Seed</button>
      </form>
    </div>
  );
}