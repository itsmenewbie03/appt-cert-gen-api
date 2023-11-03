import type { Request, Response } from "express";
import { database } from "../../db/mongo";
import type { Admin } from "../../models/Admin";
import type { Collection } from "mongodb";
import { generate_token } from "../../utils/jwt";
import {
    get_google_user,
    get_google_oauth_token,
} from "../../utils/google_auth";

const google_oauth_bind_controller = async (req: Request, res: Response) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ message: "Missing Required Parameter." });
    }
    try {
        const { id_token, access_token } = await get_google_oauth_token(code);
        if (!id_token) {
            return res
                .status(400)
                .json({ message: "The code provided is invalid." });
        }
        const { id, verified_email } = await get_google_user(
            id_token,
            access_token
        );
        if (!verified_email) {
            return res
                .status(403)
                .json({ message: "Account must have a verified email." });
        }
        // proceed to binding
        const email = req.headers["email"];
        const admins: Collection<Admin> = database.collection("admins");
        const admin = await admins
            .find({ email: email }, { projection: { _id: 0 } })
            .toArray();
        // this would be weird if this happens
        if (admin.length < 0) {
            return res
                .status(400)
                .json({ message: "Can't find admin in database." });
        }
        const admin_data = admin[0];
        if (admin_data.google_account_id) {
            return res.status(403).json({
                message: "You already have a connected google account.",
            });
        }
        const update_result = await admins.updateOne(
            { email: email },
            { $set: { google_account_id: id } }
        );
        if (!update_result.acknowledged && update_result.modifiedCount == 0) {
            return res
                .status(500)
                .json({ message: "Failed to update database." });
        }
        return res
            .status(200)
            .json({ message: "Google Account successfully bound." });
    } catch (err) {
        return res
            .status(500)
            .json({ message: "The server encountered an error. Call 911." });
    }
};

const google_oauth_login_controller = async (req: Request, res: Response) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ message: "Missing Required Parameter." });
    }
    try {
        const { id_token, access_token } = await get_google_oauth_token(code);
        if (!id_token) {
            return res
                .status(400)
                .json({ message: "The code provided is invalid." });
        }
        const { id } = await get_google_user(id_token, access_token);

        // proceed to binding
        const admins: Collection<Admin> = database.collection("admins");
        const admin = await admins
            .find({ google_account_id: id }, { projection: { _id: 0 } })
            .toArray();
        if (admin.length < 0) {
            return res.status(400).json({
                message:
                    "No admin account is connected to this google account.",
            });
        }
        const admin_data = admin[0];
        const token_data = { role: "admin", email: admin_data.email };
        const _access_token = await generate_token(token_data, "access_token");
        const _refresh_token = await generate_token(
            token_data,
            "refresh_token"
        );
        return res.status(200).json({
            message: "Login successfully",
            access_token: _access_token,
            refresh_token: _refresh_token,
        });
    } catch (err) {
        return res
            .status(500)
            .json({ message: "The server encountered an error. Call 911." });
    }
};

export { google_oauth_bind_controller, google_oauth_login_controller };
