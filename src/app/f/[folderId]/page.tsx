import DriveContents from "../../drive-contents";
import { QUERIES } from "~/server/db/queries";

export default async function GoogleDriveClone(props: {
  params: Promise<{ folderId: string }>;
}) {
  const params = await props.params;
  const parsedFolderId = parseInt(params.folderId);
  
  if (isNaN(parsedFolderId)) {
    return <div>Invalid folder ID</div>;
  }
  
  try {
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
        currentFolderId={parsedFolderId}
      ></DriveContents>
    );
  } catch (error) {
    console.error("Error loading folder:", error);
    return <div>Error: Could not load folder. {String(error)}</div>;
  }
}
