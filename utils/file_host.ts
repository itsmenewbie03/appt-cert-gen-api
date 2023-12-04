import { Dropbox } from "dropbox";
import fs from "fs";

const upload = async (file_buffer: Buffer, file_name: string) => {
  try {
    const dbx = new Dropbox({
      accessToken: Bun.env.DROPBOX_ACCESS_TOKEN,
      fetch: fetch,
    });

    const response = await dbx.filesUpload({
      path: "/" + file_name,
      contents: file_buffer,
      mode: { ".tag": "overwrite" },
    });

    const path_to_file = response.result.path_display;
    console.log(`File uploaded successfully. Shared link: ${path_to_file}`);
    return path_to_file;
  } catch (error: any) {
    console.error(
      `Error uploading to Dropbox: ${error}\nERROR: ${error.message}`,
    );
    return null;
  }
};

// NOTE: credits https://github.com/dropbox/dropbox-sdk-js/issues/1130#issuecomment-1826369913
const custom_fetch = async (
  request: Request,
  init?: RequestInit,
): Promise<Response> => {
  const response = await globalThis.fetch(request, init);

  return Object.defineProperty(response, "buffer", {
    value: response.arrayBuffer,
  });
};

const download = async (
  file_path: string,
): Promise<{ fileBinary: ArrayBuffer; name: string } | null> => {
  try {
    const dbx = new Dropbox({
      accessToken: Bun.env.DROPBOX_ACCESS_TOKEN,
      fetch: custom_fetch,
    });
    const response = await dbx.filesDownload({ path: file_path });
    //@ts-ignore
    const { fileBinary, name } = response.result;
    return { fileBinary, name };
  } catch (error) {
    console.error(`Error retrieving file from Dropbox: ${error}`);
    return null;
  }
};
export { upload, download };
