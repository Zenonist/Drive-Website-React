import DriveContents from "../../drive-contents";
import { QUERIES } from "~/server/db/queries";

export default async function GoogleDriveClone(props: {
  params: Promise<{ folderId: string }>;
}) {
  const params = await props.params;
  // NOTE: We changed typeof folderId from number to string to make sure that we can parse it intot int
  const parsedFolderId = parseInt(params.folderId);
  if (isNaN(parsedFolderId)) {
    return <div> Invalid folder ID </div>;
  }

  const [folders, files, parents] = await Promise.all([
    QUERIES.getFolders(parsedFolderId),
    QUERIES.getFiles(parsedFolderId),
    QUERIES.getAllParentsForFolder(parsedFolderId),
  ]);

  return (
    <DriveContents
      files={files}
      folders={folders}
      parents={parents.filter((parent) => parent !== undefined)}
    ></DriveContents>
  );
}
