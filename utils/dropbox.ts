import { writeFileSync, readFileSync } from 'fs';
interface DropboxRefreshTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
}
const get_new_dropbox_access_token =
  async (): Promise<DropboxRefreshTokenResponse> => {
    try {
      const resp = await fetch('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: Bun.env.DROPBOX_REFRESH_TOKEN,
          grant_type: 'refresh_token',
          client_id: Bun.env.DROPBOX_APP_KEY,
          client_secret: Bun.env.DROPBOX_APP_SECRET,
        }),
      }).then((res) => res.json());
      return resp as DropboxRefreshTokenResponse;
    } catch (error) {
      return {};
    }
  };
const refresh_dropbox_access_token = async () => {
  const { access_token } = await get_new_dropbox_access_token();
  if (!access_token) {
    return null;
  }
  update_dropbox_access_token(access_token);
  return access_token;
};

const update_dropbox_access_token = (access_token: string) => {
  writeFileSync('./.accesstoken', access_token);
};

const get_dropbox_access_token = async () => {
  try {
    const access_token = readFileSync('./.accesstoken').toString().trim();
    if (!access_token) {
      throw new Error("The file .accesstoken exists but it's empty.");
    }
    return access_token;
  } catch (err: any) {
    const { access_token } = await get_new_dropbox_access_token();
    if (!access_token) {
      return null;
    }
    update_dropbox_access_token(access_token);
    return access_token;
  }
};
export {
  get_dropbox_access_token,
  update_dropbox_access_token,
  refresh_dropbox_access_token,
};
