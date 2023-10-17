type TokenType = "access_token" | "refresh_token";

import { JWTPayload, SignJWT, jwtVerify } from "jose";

const sign = async (data: JWTPayload, token_type: TokenType) => {
    const key_buffer = Buffer.from(
        token_type == "access_token"
            ? process.env.ACCESS_TOKEN_SECRET
            : process.env.REFRESH_TOKEN_SECRET
    );
    const exp = token_type == "access_token" ? "1h" : "7d";
    return await new SignJWT(data)
        .setProtectedHeader({ alg: "HS512" })
        .setExpirationTime(exp)
        .sign(key_buffer);
};

const verify = async (token: string, token_type: TokenType) => {
    const key_buffer = Buffer.from(
        token_type == "access_token"
            ? process.env.ACCESS_TOKEN_SECRET
            : process.env.REFRESH_TOKEN_SECRET
    );
    return await jwtVerify(token, key_buffer);
};

export { sign as generate_token, verify as verify_token };
