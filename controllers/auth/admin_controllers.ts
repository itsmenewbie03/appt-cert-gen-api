import type { Request, Response } from "express";
import { database } from "../../db/mongo";
import type { Admin } from "../../models/Admin";
import type { Collection } from "mongodb";
import { compare } from "../../utils/password_auth";
import { generate_token } from "../../utils/jwt";

const admin_login_controller = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log(req.body);
    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Invalid request, please use your brain." });
    }

    const admins: Collection<Admin> = database.collection("admins");
    const admin_data = await admins
        .find({ email: email }, { projection: { _id: 0 } })
        .toArray();

    if (admin_data.length == 0) {
        return res.status(404).json({
            message:
                "No user is found with that email. Why look for someone that is non-existent?",
        });
    }
    if (!(await compare(password, admin_data[0].password))) {
        return res.status(401).json({
            message:
                "Did you perhaps forgot your password? Maybe you should stop watching p*rn?",
        });
    }
    const token_data = { role: "admin", email: email };
    const refresh_token = await generate_token(token_data, "refresh_token");
    const access_token = await generate_token(token_data, "access_token");

    await database
        .collection("refresh_tokens")
        .insertOne({ email: email, refresh_token: refresh_token });
    return res.status(200).json({
        message: "Login success",
        refresh_token: refresh_token,
        access_token: access_token,
    });
};
export { admin_login_controller };
