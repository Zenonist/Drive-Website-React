"use server";

import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { files_table, folders_table } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";
import { QUERIES } from "./db/queries";

const utapi = new UTApi();

export async function deleteFile(fileId: number) {
    const session = await auth();
    if (!session.userId) {
        throw new Error("Unauthorized");
    }

    const [file] = await db
        .select()
        .from(files_table)
        .where(and(
            eq(files_table.id, fileId),
            eq(files_table.ownerId, session.userId),
        ));

    if (!file) {
        throw new Error("File not found");
    }

    const utapiResult = await utapi.deleteFiles([file.url.replace("https://9sqiwmmhn8.ufs.sh/f/", "")]);

    console.log(utapiResult);

    const dbDeleteResult = await db.delete(files_table).where(eq(files_table.id, fileId));

    console.log(dbDeleteResult);

    // Update the cookie to force a refresh
    const c = await cookies();

    c.set("force-refresh", JSON.stringify(Math.random()));

    return {
        success: true,
    };
}

export async function createFolder(name: string, parentId: number) {
    const session = await auth();
    if (!session.userId) {
        throw new Error("Unauthorized");
    }
    const folderResult = await db.insert(folders_table).values({
        name,
        parent: parentId,
        ownerId: session.userId,
    });

    console.log(folderResult);

    // Update the cookie to force a refresh
    const c = await cookies();
    c.set("force-refresh", JSON.stringify(Math.random()));
    return {
        success: true
    }
}

export async function deleteFolder(folderId: number) {
    const session = await auth();
    if (!session.userId) {
        throw new Error("Unauthorized");
    }

    const [filesList, foldersList] = await QUERIES.getFilesAndFoldersByFolderId(folderId);
    console.log("filesList", filesList);
    console.log("foldersList", foldersList);

    // Delete all files
    while (filesList!.length > 0) {
        const fileId = filesList!.pop();
        if (!fileId) {
            break;
        }
        await deleteFile(fileId);
    }

    // Delete all subfolders
    while (foldersList!.length > 0) {
        const subFolderId = foldersList!.pop();
        if (!subFolderId) {
            break;
        }

        const dbDeleteResult = await db.delete(folders_table).where(eq(folders_table.id, subFolderId));

        console.log(dbDeleteResult);
    }

    // Delete the folder itself
    const dbDeleteResult = await db.delete(folders_table).where(eq(folders_table.id, folderId));

    console.log(dbDeleteResult);

    console.log(`Removed folder ${folderId}`)

    // Update the cookie to force a refresh
    const c = await cookies();
    c.set("force-refresh", JSON.stringify(Math.random()));
    return {
        success: true
    }
}