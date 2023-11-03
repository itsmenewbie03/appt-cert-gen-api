import type { Request, Response } from "express";
import { database } from "../../db/mongo";
import type { Admin } from "../../models/Admin";
import type { Collection } from "mongodb";
import evaluate_password from "../../utils/password_validator";
import { hash } from "../../utils/password_auth";
const employee_register_controller = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Invalid request, please use your brain." });
    }
    const admins: Collection<Admin> = database.collection("employees");
    const admin = await admins
        .find({ email: email }, { projection: { _id: 0 } })
        .toArray();

    if (admin.length > 0) {
        return res
            .status(400)
            .json({ message: "The email provided is already registered." });
    }

    const password_evaluation = evaluate_password(password);
    if (password_evaluation.length > 0) {
        const reasons = password_evaluation.map((reason, index) => {
            return reason.message.replace("string", "password");
        });
        return res.status(400).json({
            message:
                "The password provides does not pass the criteria of accepted passwords.",
            reasons: reasons,
        });
    }
    // now we should has the password and put it in the employee collections
    try {
        console.log(`HASHING PASSWORD`);
        const hashed_password = await hash(password);
        console.log(`HASHED: ${hashed_password}`);
    } catch (error: any) {
        console.log(`FAILED TO HASH\nERR: ${error.message}`);
    }
    const employee_data = {
        email: email,
        password: await hash(password),
    };
    const result = await database
        .collection("employees")
        .insertOne(employee_data);
    console.log(
        `DEBUG: the result after inserting new employee to db ${JSON.stringify(
            result
        )}`
    );
    // as if all inserts is successfull
    return res
        .status(200)
        .json({ message: "Employee registered successfully." });
};

export { employee_register_controller };
