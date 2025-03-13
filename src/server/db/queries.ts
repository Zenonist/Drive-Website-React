import "server-only";

import { db } from "~/server/db";
import {
    files_table as fileSchema,
    folders_table as folderSchema,
} from "~/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export const QUERIES = {
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
    getAllParentsForFolder: async function (folderId: number) {
        // First check if the folder exists
        const currentFolder = await db
            .select()
            .from(folderSchema)
            .where(eq(folderSchema.id, folderId));

        if (!currentFolder[0] || currentFolder.length === 0) {
            throw new Error(`Folder with ID ${folderId} not found`);
        }

        const parents = [];
        let currentFolderId: number | null = folderId;

        while (currentFolderId !== null) {
            const folder = await db
                .selectDistinct()
                .from(folderSchema)
                .where(eq(folderSchema.id, currentFolderId));

            if (!folder[0] || folder.length === 0) {
                throw new Error("parent folder not found");
            }

            // Don't check for ID 1 - instead check if it's the root folder (has null parent)
            if (folder[0]?.parent !== null) {
                parents.unshift(folder[0]);
            }

            currentFolderId = folder[0]?.parent ?? null;
        }
        return parents;
    },

    getFolders: function (folderId: number) {
        return db
            // NOTE: SQL query -> select * from folderSchema where parent == parsedFolderId
            .select()
            .from(folderSchema)
            // eq = equal
            .where(eq(folderSchema.parent, folderId))
            .orderBy(folderSchema.id);
    },

    getFiles: function (folderId: number) {
        return db
            .select()
            .from(fileSchema)
            .where(eq(fileSchema.parent, folderId))
            .orderBy(fileSchema.id);
    },
    getFolderById: async function (folderId: number) {
        const folder = await db
            .select()
            .from(folderSchema)
            .where(eq(folderSchema.id, folderId))
        if (!folder || folder.length === 0) {
            throw new Error("folder not found");
        }
        return folder[0];
    },
    getRootFolderForUser: async function (userId: string) {
        const rootFolder = await db
            .select()
            .from(folderSchema)
            .where(and(
                eq(folderSchema.ownerId, userId),
                isNull(folderSchema.parent)
            ));
        return rootFolder[0];
    }
}

export const MUTATIONS = {
    createFile: async function (input: {
        file: {
            name: string;
            size: number;
            url: string;
            parent: number;
        };
        userId: string;
    }) {
        return await db.insert(fileSchema).values({
            ...input.file,
            ownerId: input.userId
        });
    },
    onboardUser: async function (userId: string) {
        // Create the root folder for the user
        const rootFolder = await db.insert(folderSchema).values({
            name: "root",
            ownerId: userId,
            parent: null
        }).$returningId();

        console.log("rootFolder", rootFolder);

        const rootFolderId = rootFolder[0]!.id;

        await db.insert(folderSchema).values([
            {
                name: "Documents",
                ownerId: userId,
                parent: rootFolderId
            },
            {
                name: "Images",
                ownerId: userId,
                parent: rootFolderId
            },
            {
                name: "Videos",
                ownerId: userId,
                parent: rootFolderId,
            },
            {
                name: "Music",
                ownerId: userId,
                parent: rootFolderId
            }
        ])

        return rootFolderId;
    }
}