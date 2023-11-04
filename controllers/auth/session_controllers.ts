import type { Request, Response } from "express";
import { generate_token, verify_token } from "../../utils/jwt";
import {
    delete_refresh_token_by,
    find_refresh_token_by,
} from "../../services/refresh_token_services";
const session_refresh_controller = async (req: Request, res: Response) => {
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
    const refresh_token = await find_refresh_token_by({ refresh_token: token });

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
};

const session_logout_controller = async (req: Request, res: Response) => {
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

    const refresh_token = await find_refresh_token_by({ refresh_token: token });
    if (refresh_token.length == 0) {
        return res.status(404).json({
            message: "The token you provided is not found in the database.",
        });
    }
    // send a new access token now
    const delete_result = await delete_refresh_token_by({
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
};

export { session_refresh_controller, session_logout_controller };
