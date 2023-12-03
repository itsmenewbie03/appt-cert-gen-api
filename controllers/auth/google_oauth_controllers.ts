import type { Request, Response } from "express";
import { generate_token } from "../../utils/jwt";
import {
  get_google_user,
  get_google_oauth_token,
} from "../../utils/google_auth";
import { find_admin_by, update_admin_by } from "../../services/admin_services";
import { add_new_refresh_token } from "../../services/refresh_token_services";
import { Role, RoleSchema } from "../../models/RefreshTokenData";
import {
  find_employee_by,
  update_employee_by,
} from "../../services/employee_services";
import { find_user_by, update_user_by } from "../../services/user_services";

const google_oauth_bind_controller = async (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ message: "Missing Required Parameter." });
  }
  try {
    const { id_token, access_token } = await get_google_oauth_token(code);
    if (!id_token) {
      return res.status(400).json({ message: "The code provided is invalid." });
    }
    const { id, verified_email } = await get_google_user(
      id_token,
      access_token,
    );
    if (!verified_email) {
      return res
        .status(403)
        .json({ message: "Account must have a verified email." });
    }
    //  type casting email as string as this is always present
    //  thanks to my middleware
    const email = req.headers["email"] as string;
    const role = req.headers["role"] as Role;
    const find =
      role == "admin"
        ? find_admin_by
        : role == "employee"
        ? find_employee_by
        : find_user_by;
    const user = await find({ email });
    // this would be weird if this happens
    if (user.length < 0) {
      return res.status(400).json({ message: "Can't find user in database." });
    }
    const user_data = user[0];
    if (user_data?.google_account_id) {
      return res.status(403).json({
        message: "You already have a connected google account.",
      });
    }
    const update =
      role == "admin"
        ? update_admin_by
        : role == "employee"
        ? update_employee_by
        : update_user_by;

    const update_result = await update(
      { email },
      {
        google_account_id: id,
      },
    );
    if (!update_result.acknowledged && !update_result.modifiedCount) {
      return res.status(500).json({ message: "Failed to update database." });
    }
    return res
      .status(200)
      .json({ message: "Google Account successfully bound." });
  } catch (err) {
    console.log(`WE HAVE A PROBLEM: ${err}`);
    return res
      .status(500)
      .json({ message: "The server encountered an error. Call 911." });
  }
};

const google_oauth_login_controller = async (req: Request, res: Response) => {
  const { code, role } = req.body;
  if (!code || !role) {
    return res.status(400).json({ message: "Missing Required Parameter." });
  }
  const role_parsed = RoleSchema.safeParse(role);
  if (!role_parsed.success) {
    return res.status(400).json({
      message:
        "Invalid role detected, accepted roles are admin, employee and user.",
    });
  }
  try {
    const { id_token, access_token } = await get_google_oauth_token(code);
    if (!id_token) {
      return res.status(400).json({ message: "The code provided is invalid." });
    }
    const { id } = await get_google_user(id_token, access_token);

    // HACK: let's search for the user using magic xD
    const _role = role_parsed.data;
    const find =
      _role == "admin"
        ? find_admin_by
        : _role == "employee"
        ? find_employee_by
        : find_user_by;

    const user = await find({ google_account_id: id });
    if (!user.length) {
      return res.status(400).json({
        message: "No account is connected to this google account.",
      });
    }
    const user_data = user[0];
    const token_data = { role: _role, email: user_data.email };
    const _access_token = await generate_token(token_data, "access_token");
    const _refresh_token = await generate_token(token_data, "refresh_token");
    // add the refresh token to the database
    const result = await add_new_refresh_token({
      email: user_data.email,
      refresh_token: _refresh_token,
    });

    if (!result.acknowledged || !result.insertedId) {
      return res.status(500).json({
        message:
          "An error is encountered while trying to store data to the database.",
      });
    }
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
