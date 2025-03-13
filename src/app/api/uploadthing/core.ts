import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { MUTATIONS, QUERIES } from "~/server/db/queries";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    // f -> use to create a file route
    driveUploader: f({
        // Blob = anything
        blob: {
            /**
             * For full list of options and defaults, see the File Route API reference
             * @see https://docs.uploadthing.com/file-routes#route-config
             */
            maxFileSize: "1GB",
            maxFileCount: 9999,
        },
    }).input(z.object({
        folderId: z.number()
    }))
        // Set permissions and file types for this FileRoute
        .middleware(async ({ input }) => {
            // This code runs on your server before upload
            const user = await auth();

            console.log("user", user);

            // If you throw, the user will not be able to upload
            if (!user.userId) {
                const error = new UploadThingError("Unauthorized");
                throw error;
            }
            
            // Get folder information by id
            const folder = await QUERIES.getFolderById(input.folderId);

            if (!folder) {
                const error = new UploadThingError("Folder not found");
                throw error;
            }

            if (folder.ownerId !== user.userId) {
                const error = new UploadThingError("Unauthorized");
                throw error;
            }

            // ! Whatever is returned here is accessible in onUploadComplete as `metadata`
            return { userId: user.userId, parentId: input.folderId };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for userId:", metadata.userId);
            console.log("file url", file.ufsUrl);

            await MUTATIONS.createFile({
                file: {
                    name: file.name,
                    size: file.size,
                    url: file.ufsUrl,
                    parent: metadata.parentId,
                },
                userId: metadata.userId,
            })

            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
            return { uploadedBy: metadata.userId };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
