"use server";

import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { files_table, files_table as fileSchema, folders_table as folderSchema } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";

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