import type { Request, Response } from "express";
import evaluate_password from "../../utils/password_validator";
import { hash } from "../../utils/password_auth";
import { ResidentSchema } from "../../models/Resident";
import { add_new_resident } from "../../services/resident_services";
import { add_new_user, find_user_by } from "../../services/user_services";
import { User } from "../../models/User";
import { add_new_pending_resident } from "../../services/pending_resident_services";
import { add_new_pending_user } from "../../services/pending_user_services";

// TODO: implement recaptcha if needed to avoid spam
const user_signup_controller = async (req: Request, res: Response) => {
  const { email, password, info } = req.body;
  if (!email || !password || !info) {
    return res
      .status(400)
      .json({ message: "Invalid request, please use your brain." });
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

  const user = await find_user_by({ email });

  if (user.length > 0) {
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
  // NOTE: the try...catch below is useless xD
  // now we should hash the password and put it in the employee collections
  try {
    console.log(`HASHING PASSWORD`);
    const hashed_password = await hash(password);
    console.log(`HASHED: ${hashed_password}`);
  } catch (error: any) {
    console.log(`FAILED TO HASH\nERR: ${error.message}`);
  }

  const add_new_resident_result = await add_new_pending_resident(
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

  const resident_data_id = add_new_resident_result.insertedId;
  console.log(`DEBUG: resident data added with id: ${resident_data_id}`);

  const user_data: User = {
    email: email,
    password: await hash(password),
    resident_data_id: resident_data_id,
  };
  const result = await add_new_pending_user(user_data);
  console.log(
    `DEBUG: the result after inserting new user to db ${JSON.stringify(
      result,
    )}`,
  );
  if (!result.acknowledged || !result.insertedId) {
    return res.status(500).json({
      message:
        "An error is encountered while trying to store data to the database.",
    });
  }
  return res.status(200).json({
    message: "User registered success and is now waiting for approval.",
  });
};

const user_register_controller = async (req: Request, res: Response) => {
  const { email, password, info } = req.body;
  if (!email || !password || !info) {
    return res
      .status(400)
      .json({ message: "Invalid request, please use your brain." });
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

  const user = await find_user_by({ email });

  if (user.length > 0) {
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

  const resident_data_id = add_new_resident_result.insertedId;
  console.log(`DEBUG: resident data added with id: ${resident_data_id}`);

  const user_data: User = {
    email: email,
    password: await hash(password),
    resident_data_id: resident_data_id,
  };
  const result = await add_new_user(user_data);
  console.log(
    `DEBUG: the result after inserting new user to db ${JSON.stringify(
      result,
    )}`,
  );
  if (!result.acknowledged || !result.insertedId) {
    return res.status(500).json({
      message:
        "An error is encountered while trying to store data to the database.",
    });
  }
  return res.status(200).json({ message: "User registered successfully." });
};

export { user_register_controller, user_signup_controller };
