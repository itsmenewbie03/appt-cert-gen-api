import type { Request, Response } from "express";
import evaluate_password from "../../utils/password_validator";
import { hash } from "../../utils/password_auth";
import {
    add_new_employee,
    find_employee_by,
} from "../../services/employee_services";
const employee_register_controller = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Invalid request, please use your brain." });
    }
    const employee = await find_employee_by({ email });

    if (employee.length > 0) {
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
    const result = await add_new_employee(employee_data);
    console.log(
        `DEBUG: the result after inserting new employee to db ${JSON.stringify(
            result
        )}`
    );
    if (!result.acknowledged || !result.insertedId) {
        return res.status(500).json({
            message:
                "An error is encountered while trying to store data to the database.",
        });
    }
    return res
        .status(200)
        .json({ message: "Employee registered successfully." });
};

export { employee_register_controller };
