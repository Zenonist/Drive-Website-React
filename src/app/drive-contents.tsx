"use client";

import { useMemo, useState } from "react";
import { Folder, FileIcon, Upload, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { FileRow, FolderRow } from "./file-row";
import { files_table, folders_table } from "~/server/db/schema";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

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
 * @returns A React component that mimics Google Drive's file browser interface
 */
export default function DriveContents(props: {
  files: (typeof files_table.$inferSelect)[];
  folders: (typeof folders_table.$inferSelect)[];
  // we use same type as folders because parents represent folders
  parents: (typeof folders_table.$inferSelect)[];
}) {
  const breadcrumbs: unknown[] = [];

  const handleUpload = () => {
    alert("Upload functionality would be implemented here");
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/f/1"
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
              <div className="col-span-3">Type</div>
              <div className="col-span-3">Size</div>
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
      </div>
    </div>
  );
}
