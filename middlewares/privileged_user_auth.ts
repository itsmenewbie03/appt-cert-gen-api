import type { Request, Response, NextFunction } from "express";
import { verify_token } from "../utils/jwt";
import { fireabase_verify_token } from "../utils/firebase_auth";

const privileged_user_auth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
  // privilege
  const token = /(?<=Bearer\s)(.*)/g.exec(authorization)?.[0];
  if (!token) {
    return res.status(403).json({
      message: "So you're a bit of a hacker huh? You can do better.",
    });
  }
  const token_data = await verify_token(token, "access_token").catch(
    (err) => err.code,
  );
  // NOTE: we will check if token_data is undefined
  // this due to us integrating Firebase Auth in the client side
  if (!token_data) {
    console.log(":: DEBUG (TOKEN_DATA) priv_user_auth: ", token_data);
    const firebase_verify_result = await fireabase_verify_token(token);
    if (!firebase_verify_result) {
      return res.status(403).json({
        message: "So you're a bit of a hacker huh? You can do better.",
      });
    }
    // WARN: this is a temporary solution
    // we need a better way like implement a database
    // in which a firebase uid is mapped to their respective role
    req.headers["role"] = "admin";
    req.headers["email"] = firebase_verify_result.email;
    next();
    // NOTE: not sure if next causes the function to return
    // so we will do an early return
    return;
  }
  // check if ERR_JWS_INVALID || ERR_JWT_EXPIRED || ERR_JWS_SIGNATURE_VERIFICATION_FAILED
  if (error_codes.includes(token_data)) {
    return res.status(403).json({
      message: "So you're persistent huh? Maybe you could actually do it.",
    });
  }
  const { role } = token_data?.payload;
  if (!role) {
    return res
      .status(400)
      .json({ message: "The token does not contain the needed data." });
  }
  if (role !== "admin" && role !== "employee") {
    return res.status(403).json({
      message: "You need to be a privileged user to do this.",
    });
  }
  req.headers["email"] = token_data.payload.email;
  req.headers["role"] = token_data.payload.role;
  next();
};
export { privileged_user_auth };
