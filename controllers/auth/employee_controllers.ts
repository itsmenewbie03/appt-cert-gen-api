import type { Request, Response } from "express";
import { compare } from "../../utils/password_auth";
import { generate_token } from "../../utils/jwt";
import { find_employee_by } from "../../services/employee_services";
import { add_new_refresh_token } from "../../services/refresh_token_services";

const employee_login_controller = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log(req.body);
    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Invalid request, please use your brain." });
    }

    const employee_data = await find_employee_by({ email });

    if (employee_data.length == 0) {
        return res.status(404).json({
            message:
                "No user is found with that email. Why look for someone that is non-existent?",
        });
    }
    if (!(await compare(password, employee_data[0].password))) {
        return res.status(401).json({
            message:
                "Did you perhaps forgot your password? Maybe you should stop watching p*rn?",
        });
    }
    // now the user passed all the test
    // we will now give the user an accessToken and a refreshToken
    // the refreshToken should be stored in db {email,refreshToken}
    const token_data = { role: "employee", email: email };
    const refresh_token = await generate_token(token_data, "refresh_token");
    const access_token = await generate_token(token_data, "access_token");

    const result = await add_new_refresh_token({
        email: email,
        refresh_token: refresh_token,
    });

    if (!result.acknowledged || !result.insertedId) {
        return res.status(500).json({
            message:
                "An error is encountered while trying to store data to the database.",
        });
    }
    return res.status(200).json({
        message: "Login success",
        refresh_token: refresh_token,
        access_token: access_token,
    });
};

export { employee_login_controller };
