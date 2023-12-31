declare namespace NodeJS {
  interface ProcessEnv {
    CONNECTION_STRING: string;
    DATABASE_NAME: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    GAUTH_CLIENT_ID: string;
    GAUTH_CLIENT_SECRET: string;
    RECAPTCHA_SECRET: string;
    DROPBOX_REFRESH_TOKEN: string;
    DROPBOX_APP_KEY: string;
    DROPBOX_APP_SECRET: string;
  }
}
