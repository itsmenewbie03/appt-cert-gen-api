import { Router, json } from "express";
import type { Request, Response } from "express";
import { database } from "../../db/mongo";
import type { RefreshToken } from "../../models/RefreshToken";
import type { Collection } from "mongodb";
import { generate_token, verify_token } from "../../utils/jwt";

const session_router = Router();

session_router.use(json());

session_router.get("/refresh", async (req: Request, res: Response) => {
    const error_codes = [
        "ERR_JWT_EXPIRED",
        "ERR_JWS_INVALID",
        "ERR_JWS_SIGNATURE_VERIFICATION_FAILED",
    ];
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({
            message:
                "You are not authorized to access this resource. Wanna go to jail?",
        });
    }
    const token = /(?<=Bearer\s)(.*)/g.exec(authorization)?.[0];
    if (!token) {
        return res.status(403).json({
            message: "So you're a bit of a hacker huh? You can do better.",
        });
    }
    // let's verify the token still because we have trust issues
    const token_data = await verify_token(token, "refresh_token").catch(
        (err) => err.code
    );
    // check if ERR_JWS_INVALID || ERR_JWT_EXPIRED || ERR_JWS_SIGNATURE_VERIFICATION_FAILED
    if (error_codes.includes(token_data)) {
        return res.status(403).json({
            message:
                "So you're persistent huh? Maybe you could actually do it.",
        });
    }
    const { role, email } = token_data?.payload;
    // trust issues go brrrrr
    if (!role || !email) {
        return res.status(403).json({
            message: "Token does not contain all the needed information.",
        });
    }
    // check if the refresh token is in db
    const refresh_tokens: Collection<RefreshToken> =
        database.collection("refresh_tokens");
    const refresh_token = await refresh_tokens
        .find({ refresh_token: token }, { projection: { _id: 0 } })
        .toArray();
    if (refresh_token.length == 0) {
        return res.status(404).json({
            message: "The token you provided is not found in the database.",
        });
    }
    // send a new access token now
    const access_token_data = { role: role, email: email };
    const access_token = await generate_token(
        access_token_data,
        "access_token"
    );
    return res.status(200).json({
        message: "Access token successfully generated",
        access_token: access_token,
    });
});

session_router.post("/logout", async (req: Request, res: Response) => {
    const error_codes = [
        "ERR_JWT_EXPIRED",
        "ERR_JWS_INVALID",
        "ERR_JWS_SIGNATURE_VERIFICATION_FAILED",
    ];
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({
            message:
                "You are not authorized to access this resource. Wanna go to jail?",
        });
    }
    const token = /(?<=Bearer\s)(.*)/g.exec(authorization)?.[0];
    if (!token) {
        return res.status(403).json({
            message: "So you're a bit of a hacker huh? You can do better.",
        });
    }
    // let's verify the token still because we have trust issues
    const token_data = await verify_token(token, "refresh_token").catch(
        (err) => err.code
    );
    // check if ERR_JWS_INVALID || ERR_JWT_EXPIRED || ERR_JWS_SIGNATURE_VERIFICATION_FAILED
    if (error_codes.includes(token_data)) {
        return res.status(403).json({
            message:
                "So you're persistent huh? Maybe you could actually do it.",
        });
    }
    const { role, email } = token_data?.payload;
    // trust issues go brrrrr
    if (!role || !email) {
        return res.status(403).json({
            message: "Token does not contain all the needed information.",
        });
    }
    // check if the refresh token is in db
    const refresh_tokens: Collection<RefreshToken> =
        database.collection("refresh_tokens");
    const refresh_token = await refresh_tokens
        .find({ refresh_token: token }, { projection: { _id: 0 } })
        .toArray();
    if (refresh_token.length == 0) {
        return res.status(404).json({
            message: "The token you provided is not found in the database.",
        });
    }
    // send a new access token now
    const delete_result = await refresh_tokens.deleteOne({
        refresh_token: token,
    });
    if (delete_result.acknowledged && delete_result.deletedCount > 0) {
        return res.status(200).json({
            message: "Logout successful",
        });
    }
    return res.status(400).json({
        message: "Logout failed, please try again.",
    });
});

export default session_router;