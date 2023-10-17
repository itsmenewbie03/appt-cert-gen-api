import type { Request, Response, NextFunction } from "express";
import { verify_token } from "../utils/jwt";
const admin_auth = async (req: Request, res: Response, next: NextFunction) => {
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
    const token_data = await verify_token(token, "access_token").catch(
        (err) => err.code
    );
    // will handle this tomorrow
};
