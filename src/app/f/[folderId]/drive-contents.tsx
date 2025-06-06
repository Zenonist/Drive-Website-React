"use client";

import { ChevronRight } from "lucide-react";
import { FileRow, FolderRow } from "./file-row";
import type { files_table, folders_table } from "~/server/db/schema";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { UploadButton } from "~/utils/uploadthing";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { createFolder } from "~/server/actions";
/**
 * A Google Drive clone component that displays folders and files in a hierarchical structure.
 *
 * This component provides:
 * - Navigation through folders with breadcrumb support
 * - Display of files and folders in the current directory
 * - Basic upload button (functionality to be implemented)
 *
 * @param props - Component properties
 * @param props.files - Collection of file objects inferred from the database schema
 *                      using Drizzle ORM's $inferSelect method, which extracts the
 *                      type from the 'files' table schema
 * @param props.folders - Collection of folder objects inferred from the database schema
 *                        using Drizzle ORM's $inferSelect method, which extracts the
 *                        type from the 'folders' table schema
 * @param props.parents - Collection of parent folder objects inferred from the database schema
 *                        using Drizzle ORM's $inferSelect method, which extracts the
 *                        type from the 'folders' table schema
 * @returns A React component that mimics Google Drive's file browser interface
 */
export default function DriveContents(props: {
  files: (typeof files_table.$inferSelect)[];
  folders: (typeof folders_table.$inferSelect)[];
  // we use same type as folders because parents represent folders
  parents: (typeof folders_table.$inferSelect)[];

  currentFolderId: number;
}) {
  const navigate = useRouter();
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href={`/drive`}
              className="mr-2 text-gray-300 hover:text-gray-100"
            >
              My Drive
            </Link>
            {props.parents.map((folder) => (
              <div key={folder.id} className="flex items-center">
                <ChevronRight className="mx-2 text-gray-500" size={16} />
                <Link
                  href={`/f/${folder.id}`}
                  className="text-gray-300 hover:text-white"
                >
                  {folder.name}
                </Link>
              </div>
            ))}
          </div>
          <div>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
        <div className="rounded-lg bg-gray-800 shadow-xl">
          <div className="border-b border-gray-700 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-1"></div>
            </div>
          </div>
          <ul>
            {props.folders.map((folder) => (
              <FolderRow key={folder.id} folder={folder} />
            ))}
            {props.files.map((file) => (
              <FileRow key={file.id} file={file} />
            ))}
          </ul>
        </div>
        
        <div className="mt-4 flex items-center">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-gray-700 bg-gray-800 hover:bg-gray-700"
              onClick={() => setIsCreateFolderOpen(true)}
            >
              Create Folder
            </Button>
          <div className="flex-1 flex justify-end">
            <UploadButton
              endpoint="driveUploader"
              onClientUploadComplete={() => {
                // Nextjs will update new route (hot-swap)
                navigate.refresh();
              }}
              input={{
                folderId: props.currentFolderId,
              }}
            />
          </div>
        </div>
            <Dialog
              open={isCreateFolderOpen}
              onOpenChange={(open: boolean | ((prevState: boolean) => boolean)) => {
                setIsCreateFolderOpen(open);
                if (!open) setNewFolderName("");
              }}
            >
              <DialogContent className="border-gray-700 bg-gray-800 text-gray-100">
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <form className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label htmlFor="folderName" className="text-sm font-medium">
                      Folder Name
                    </label>
                    <input
                      id="folderName"
                      value={newFolderName}
                      onChange={(e) => {
                        setNewFolderName(e.target.value);
                      }}
                      placeholder="Enter folder name"
                      className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        await createFolder(newFolderName, props.currentFolderId);
                        setNewFolderName("");
                        setIsCreateFolderOpen(false);
                      }}
                      className="border-gray-600 bg-gray-700 hover:bg-gray-600"
                    >
                      Create
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setNewFolderName("");
                        setIsCreateFolderOpen(false);
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
  );
}
