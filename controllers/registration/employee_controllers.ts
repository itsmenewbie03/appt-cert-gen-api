import type { Request, Response } from "express";
import evaluate_password from "../../utils/password_validator";
import { hash } from "../../utils/password_auth";
import { ResidentSchema, ResidentData } from "../../models/Resident";
import {
  add_new_resident,
  find_resident_by,
} from "../../services/resident_services";
import {
  add_new_employee,
  find_employee_by,
} from "../../services/employee_services";
import { Admin } from "../../models/Admin";
import { is_valid_email } from "../../utils/email_validator";
import {
  duration_to_seconds,
  get_age_in_seconds,
} from "../../utils/date_utils";

const employee_register_controller = async (req: Request, res: Response) => {
  const { email, password, info } = req.body;
  if (!email || !password || !info) {
    return res
      .status(400)
      .json({ message: "Invalid request, please use your brain." });
  }

  if (!(await is_valid_email(email))) {
    return res.status(400).json({
      message: "The email provided is not valid.",
    });
  }

  const resident_validator = ResidentSchema.strip();
  const resident_data_parsed = resident_validator.safeParse(info);

  if (!resident_data_parsed.success) {
    return res.status(400).json({
      message: `The resident data provided is not valid.`,
      cause: `${resident_data_parsed.error.issues
        .map((val, i) => `${val.path.join("|")}: ${val.message}`)
        .join("; ")}.`,
    });
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

  // INFO: perform a check if the resident is already registered
  const { first_name, last_name, date_of_birth } = resident_data_parsed.data;
  const possible_match = await find_resident_by({
    first_name,
    last_name,
    date_of_birth,
  });

  let resident_id = possible_match[0]?._id;

  if (!possible_match.length) {
    // INFO: validate the dob if it is in the future
    // INFO: validate the period of residency if is does not exceed the age of the resident

    const { period_of_residency, date_of_birth } = resident_data_parsed.data;
    if (date_of_birth > new Date(Date.now())) {
      return res.status(400).json({
        message: "The date of birth provided is in the future.",
      });
    }

    const period_of_residency_in_sec = duration_to_seconds(period_of_residency);
    if (period_of_residency_in_sec < 0) {
      return res.status(400).json({
        message: "Invalid period of residency.",
      });
    }

    const age_in_seconds = get_age_in_seconds(date_of_birth);
    if (age_in_seconds < period_of_residency_in_sec) {
      return res.status(400).json({
        message: "The period of residency exceeds the age of the resident.",
      });
    }

    const add_new_resident_result = await add_new_resident(
      resident_data_parsed.data,
    );
    if (
      !add_new_resident_result.acknowledged ||
      !add_new_resident_result.insertedId
    ) {
      return res.status(500).json({
        message: "Failed to insert resident's info to the database",
      });
    }
    resident_id = add_new_resident_result.insertedId;
  }

  const employee_data: Admin = {
    email: email,
    password: await hash(password),
    resident_data_id: resident_id,
  };

  const result = await add_new_employee(employee_data);
  console.log(
    `DEBUG: the result after inserting new employee to db ${JSON.stringify(
      result,
    )}`,
  );
  if (!result.acknowledged || !result.insertedId) {
    return res.status(500).json({
      message:
        "An error is encountered while trying to store data to the database.",
    });
  }
  return res.status(200).json({ message: "Employee registered successfully." });
};

export { employee_register_controller };
