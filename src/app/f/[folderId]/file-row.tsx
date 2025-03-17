import { Folder as FolderIcon, FileIcon, Trash2 } from "lucide-react";
// Link is a component that allows you to navigate between pages in your Next.js application without reloading the entire page.
import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "~/components/ui/dialog";
import { deleteFile, deleteFolder } from "~/server/actions";
import type { folders_table, files_table } from "~/server/db/schema";

export function FileRow(props: { file: typeof files_table.$inferSelect }) {
  const { file } = props;
  return (
    <li
      key={file.id}
      className="hover:bg-gray-750 border-b border-gray-700 px-6 py-4"
    >
      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-6 flex items-center">
          <Link
            href={file.url}
            className="flex items-center text-gray-100 hover:text-blue-400"
            // target="_blank" uses to open the page in a new tab
            target="_blank"
          >
            <FileIcon className="mr-3" size={20} />
            {file.name}
          </Link>
        </div>
        <div className="col-span-2 text-gray-400">{"file"}</div>
        <div className="col-span-2 text-gray-400">{`${(file.size / 1024).toFixed(2)} KB`}</div>
        <div className="col-span-2 text-gray-400">
          <Button variant="ghost" onClick={() => deleteFile(file.id)}>
            <Trash2 className="mr-2" size={16} />
          </Button>
        </div>
      </div>
    </li>
  );
}

export function FolderRow(props: {
  folder: typeof folders_table.$inferSelect;
}) {
  const { folder } = props;
  const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
  return (
    <li
      key={folder.id}
      className="hover:bg-gray-750 border-b border-gray-700 px-6 py-4"
    >
      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-6 flex items-center">
          <Link
            href={`/f/${folder.id}`}
            className="flex items-center text-gray-100 hover:text-blue-400"
          >
            <FolderIcon className="mr-3" size={20} />
            {folder.name}
          </Link>
        </div>
        <div className="col-span-2 text-gray-400"></div>
        <div className="col-span-2 text-gray-400"></div>
        <div className="col-span-2 text-gray-400">
          <Button variant="ghost" onClick={() => setIsDeleteFolderOpen(true)}>
            <Trash2 className="mr-2" size={16} />
          </Button>
          <Dialog
            open={isDeleteFolderOpen}
            onOpenChange={(
              open: boolean | ((prevState: boolean) => boolean),
            ) => {
              setIsDeleteFolderOpen(open);
            }}
          >
            <DialogContent className="border-gray-700 bg-gray-800 text-gray-100">
              <DialogHeader>
                <DialogTitle>Delete folder</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label htmlFor="folderName" className="text-sm font-medium">
                    Are you sure you want to delete this folder?
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      await deleteFolder(folder.id);
                      setIsDeleteFolderOpen(false);
                    }}
                    className="border-gray-600 bg-gray-700 hover:bg-gray-600"
                  >
                    Delete
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDeleteFolderOpen(false);
                    }}
                    className="border-gray-600 bg-gray-700 hover:bg-gray-600"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </li>
  );
}
