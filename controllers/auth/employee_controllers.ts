import type { Request, Response } from 'express';
import { compare, hash } from '../../utils/password_auth';
import { generate_token } from '../../utils/jwt';
import {
  delete_employee_by,
  find_employee_by,
  update_employee_by,
} from '../../services/employee_services';
import { add_new_refresh_token } from '../../services/refresh_token_services';
import { AdminSchema } from '../../models/Admin';
import evaluate_password from '../../utils/password_validator';
import { validate_recaptcha } from '../../utils/recaptcha';
import { upload_image } from '../../utils/image_host';
import { find_resident_by_id } from '../../services/resident_services';
import { ObjectId } from 'mongodb';

const employee_login_controller = async (req: Request, res: Response) => {
  const { email, password, recaptcha_token } = req.body;
  console.log(req.body);
  if (!email || !password || !recaptcha_token) {
    return res
      .status(400)
      .json({ message: 'Invalid request, please use your brain.' });
  }
  const verification_result = await validate_recaptcha(recaptcha_token);
  if (!verification_result.success) {
    return res.status(400).json({
      message: 'Recaptcha verification failed',
      cause: `${verification_result['error-codes'].join('\n')}`,
    });
  }
  if (verification_result.score <= 0.4) {
    return res.status(400).json({
      message: 'Recaptcha verification failed because the score is too low.',
    });
  }
  const employee_data = await find_employee_by({ email });

  if (employee_data.length == 0) {
    return res.status(404).json({
      message:
        'No user is found with that email. Why look for someone that is non-existent?',
    });
  }
  if (!(await compare(password, employee_data[0].password))) {
    return res.status(401).json({
      message:
        'Did you perhaps forgot your password? Maybe you should stop watching p*rn?',
    });
  }
  // now the user passed all the test
  // we will now give the user an accessToken and a refreshToken
  // the refreshToken should be stored in db {email,refreshToken}
  const token_data = { role: 'employee', email: email };
  const refresh_token = await generate_token(token_data, 'refresh_token');
  const access_token = await generate_token(token_data, 'access_token');

  const result = await add_new_refresh_token({
    email: email,
    refresh_token: refresh_token,
  });

  if (!result.acknowledged || !result.insertedId) {
    return res.status(500).json({
      message:
        'An error is encountered while trying to store data to the database.',
    });
  }
  return res.status(200).json({
    message: 'Login success',
    refresh_token: refresh_token,
    access_token: access_token,
  });
};

const employee_delete_controller = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      message: 'Please provide the email of the employee account to delete.',
    });
  }
  // check if employee with the specified email exists
  const employee = await find_employee_by({ email });
  if (!employee.length) {
    return res.status(404).json({
      message: 'Employee with that email is not found in the database.',
    });
  }
  const result = await delete_employee_by({ email: email });
  if (!result.acknowledged || !result.deletedCount) {
    return res.status(400).json({ message: 'Failed to delete employee.' });
  }
  return res.status(200).json({ message: 'Employee deleted successfully.' });
};

const employee_update_controller = async (req: Request, res: Response) => {
  const { query, update } = req.body;
  if (!query || !update) {
    return res.status(400).json({
      message: 'Please provide the query and update.',
    });
  }
  // check if employee with the query exists
  const employee = await find_employee_by({ ...query });
  if (!employee.length) {
    return res.status(404).json({
      message:
        "Can't find employee based on the query provided. If you are using firebase auth make sure the email is also registered in the web version.",
    });
  }
  // lets validate the update
  const update_schema = AdminSchema.partial().strip();
  const parsed_update = update_schema.safeParse(update);
  if (!parsed_update.success) {
    return res.status(400).json({
      message: `The update data provided is not valid.`,
      cause: `${parsed_update.error.issues
        .map((val, i) => `${val.path.join('|')}: ${val.message}`)
        .join('; ')}.`,
    });
  }
  console.log(`Updating with ${JSON.stringify(parsed_update.data)}`);

  // prevent password override
  if (parsed_update.data.password) {
    return res.status(403).json({
      message: 'This is not the endpoint for changing password.',
    });
  }
  const result = await update_employee_by(
    { ...query },
    { ...parsed_update.data },
  );
  if (!result.acknowledged || !result.modifiedCount) {
    return res.status(400).json({
      message: 'Failed to update the data in the database.',
    });
  }
  return res.status(200).json({ message: 'Employee updated successfully.' });
};

const employee_change_password_controller = async (
  req: Request,
  res: Response,
) => {
  // these are always a string
  const role = req.headers['role'] as string;

  const { email, current_password, new_password, confirm_new_password } =
    req.body;
  if (
    (!current_password && role !== 'admin') ||
    !new_password ||
    !confirm_new_password
  ) {
    return res.status(400).json({ message: 'Missing parameters.' });
  }
  const employee = await find_employee_by({ email });
  if (!employee.length) {
    return res
      .status(404)
      .json({ message: 'No employee is found with the email provided.' });
  }
  const { password } = employee[0];
  if (role !== 'admin' && !(await compare(current_password, password))) {
    return res
      .status(400)
      .json({ message: 'The current password provided is incorrect.' });
  }
  if (current_password === new_password) {
    return res.status(400).json({
      message: 'The new password is the same with the current password.',
    });
  }

  if (new_password !== confirm_new_password) {
    return res.status(400).json({
      message: 'The new password and confirm new password does not match.',
    });
  }
  const password_evaluation = evaluate_password(new_password);
  if (password_evaluation.length > 0) {
    const reasons = password_evaluation.map((reason, index) => {
      return reason.message.replace('string', 'password');
    });
    return res.status(400).json({
      message:
        'The password provides does not pass the criteria of accepted passwords.',
      reasons: reasons,
    });
  }

  // now we can update the password
  const hashed_new_password = await hash(new_password);
  const update_result = await update_employee_by(
    { email },
    { password: hashed_new_password },
  );
  if (!update_result.acknowledged || !update_result.modifiedCount) {
    return res.status(500).json({ message: 'Failed to update the database.' });
  }
  return res.status(200).json({ message: 'Password successfully changed.' });
};

const employee_avatar_update_controller = async (
  req: Request,
  res: Response,
) => {
  const { base64_image } = req.body;
  if (!base64_image) {
    return res.status(400).json({
      message: 'Please provide the query and update.',
    });
  }
  // NOTE: this will be called after privileged_user_auth middleware
  // so we will have the email in the headers
  const email = req.headers['email'] as string;
  const employee = await find_employee_by({ email: email });
  if (!employee.length) {
    return res.status(404).json({
      message:
        "Can't find employee based on the query provided. If you are using firebase auth make sure the email is also registered in the web version.",
    });
  }
  // INFO: we will upload the base64_image and update the avatar url with the returned url
  const image_buf = Buffer.from(base64_image, 'base64');
  const url = await upload_image(image_buf);
  if (!url) {
    // NOTE: this should be 500 but we will instead blame the client by returning 400 xD
    return res.status(400).json({ message: 'Failed to upload the image.' });
  }
  const update = { avatar_url: url };
  const update_schema = AdminSchema.partial().strip();
  const parsed_update = update_schema.safeParse(update);
  if (!parsed_update.success) {
    return res.status(400).json({
      message: `The update data provided is not valid.`,
      cause: `${parsed_update.error.issues
        .map((val, i) => `${val.path.join('|')}: ${val.message}`)
        .join('; ')}.`,
    });
  }
  console.log(`Updating with ${JSON.stringify(parsed_update.data)}`);

  // prevent password override
  if (parsed_update.data.password) {
    return res.status(403).json({
      message: 'This is not the endpoint for changing password.',
    });
  }
  const result = await update_employee_by(
    { email: email },
    { ...parsed_update.data },
  );
  if (!result.acknowledged || !result.modifiedCount) {
    return res.status(400).json({
      message: 'Failed to update the data in the database.',
    });
  }
  return res
    .status(200)
    .json({ message: 'Employee avatar updated successfully.' });
};

const employee_data_controller = async (req: Request, res: Response) => {
  // NOTE: this will be called after privileged_user_auth middleware
  const email = req.headers['email'] as string;
  const employee = await find_employee_by({ email });
  if (!employee.length) {
    return res.status(404).json({
      message:
        "Can't find employee based on the email in the header. If you are using firebase auth make sure the email is also registered in the web version.",
    });
  }
  // INFO: fetch the resident info of the employee
  const { resident_data_id } = employee[0];
  if (!resident_data_id) {
    return res.status(404).json({
      message:
        'No resident_id is found for this employee account. Ensure that employee accounts are registered using the web dashboard',
    });
  }
  // INFO: fetch the resident data
  // we will be defensive here, making sure that resident_data_id is of type ObjectId
  const resident_data = await find_resident_by_id(
    new ObjectId(resident_data_id),
  );
  if (!resident_data.length) {
    return res.status(404).json({
      message:
        'No resident_data is found for this employee. Ensure that employee accounts are registered using the web dashboard',
    });
  }
  // HACK: spread deez nuts xD
  const merged_data = { ...employee[0], ...resident_data[0] };
  return res
    .status(200)
    .json({ message: 'Employee found.', data: merged_data });
};

export {
  employee_login_controller,
  employee_delete_controller,
  employee_update_controller,
  employee_change_password_controller,
  employee_avatar_update_controller,
  employee_data_controller,
};
