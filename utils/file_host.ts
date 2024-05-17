import { Dropbox } from 'dropbox';
import {
  get_dropbox_access_token,
  refresh_dropbox_access_token,
} from './dropbox';

const upload = async (
  file_buffer: Buffer,
  file_name: string,
): Promise<string | null | undefined> => {
  try {
    const access_token = await get_dropbox_access_token();
    if (!access_token) {
      console.log("Weird we didn't get an access_token.");
      return null;
    }

    const dbx = new Dropbox({
      accessToken: access_token,
      fetch: fetch,
    });

    const resp = await dbx.filesUpload({
      path: '/TEMPLATES/' + file_name,
      contents: file_buffer,
      mode: { '.tag': 'overwrite' },
    });

    const path_to_file = resp.result.path_display;
    console.log(`File uploaded successfully. Shared link: ${path_to_file}`);
    return path_to_file;
  } catch (error: any) {
    if (/40[01]/.test(error.message)) {
      // HACK: i'm gonna do this recursively coz why not xD
      console.log(`We got ${error.message} on uploading, but we got this xD`);
      const new_access_token = await refresh_dropbox_access_token();
      if (!new_access_token) {
        return null;
      }
      return await upload(file_buffer, file_name);
    }
    return null;
  }
};

// NOTE: credits https://github.com/dropbox/dropbox-sdk-js/issues/1130#issuecomment-1826369913
const custom_fetch = async (
  request: Request,
  init?: RequestInit,
): Promise<Response> => {
  const response = await globalThis.fetch(request, init);

  return Object.defineProperty(response, 'buffer', {
    value: response.arrayBuffer,
  });
};

const download = async (
  file_name: string,
): Promise<{ fileBinary: ArrayBuffer; name: string } | null> => {
  try {
    const access_token = await get_dropbox_access_token();
    if (!access_token) {
      console.log("Weird we didn't get an access_token.");
      return null;
    }
    const dbx = new Dropbox({
      accessToken: access_token,
      fetch: custom_fetch,
    });
    const response = await dbx.filesDownload({
      path: `${file_name}`,
    });
    //@ts-ignore
    const { fileBinary, name } = response.result;
    return { fileBinary, name };
  } catch (error: any) {
    if (/40[01]/.test(error.message)) {
      // HACK: i'm gonna do this recursively coz why not xD
      console.log(`We got ${error.message} on downloading, but we got this xD`);
      const new_access_token = await refresh_dropbox_access_token();
      if (!new_access_token) {
        return null;
      }
      return await download(file_name);
    }
    console.error(`Error retrieving file from Dropbox: ${error}`);
    return null;
  }
};

export { upload, download };
