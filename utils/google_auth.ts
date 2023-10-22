import qs from "querystring";
interface GoogleTokensResult {
    access_token: string;
    expires_in: Number;
    refresh_token: string;
    scope: string;
    token_type: string;
    id_token: string;
}

interface GoogleUserResult {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
}

const getGoogleOAuthTokens = async (
    code: string
): Promise<GoogleTokensResult> => {
    const url = "https://oauth2.googleapis.com/token";

    const values = {
        code,
        client_id: process.env.GAUTH_CLIENT_ID,
        client_secret: process.env.GAUTH_CLIENT_SECRET,
        redirect_uri: "http://localhost:5173/oauth",
        grant_type: "authorization_code",
    };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
            },
            body: qs.stringify(values),
        }).then((res) => res.json());
        //@ts-ignore
        return res;
    } catch (error: any) {
        console.error(error.response.data.error);
        throw new Error(error.message);
    }
};

const getGoogleUser = async (
    id_token: string,
    access_token: string
): Promise<GoogleUserResult> => {
    try {
        const resp = await fetch(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${id_token}`,
                },
            }
        ).then((res) => res.json());
        //@ts-ignore
        return resp;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export {
    getGoogleUser as get_google_user,
    getGoogleOAuthTokens as get_google_oauth_token,
};
