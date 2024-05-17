import type { Request, Response } from 'express';
import { compare } from '../../utils/password_auth';
import { generate_token } from '../../utils/jwt';
import { find_user_by } from '../../services/user_services';
import { add_new_refresh_token } from '../../services/refresh_token_services';
import { validate_recaptcha } from '../../utils/recaptcha';
const user_login_controller = async (req: Request, res: Response) => {
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
  const user_data = await find_user_by({ email });
  if (user_data.length == 0) {
    return res.status(404).json({
      message:
        'No user is found with that email. Why look for someone that is non-existent?',
    });
  }
  if (!(await compare(password, user_data[0].password))) {
    return res.status(401).json({
      message:
        'Did you perhaps forgot your password? Maybe you should stop watching p*rn?',
    });
  }
  const token_data = { role: 'user', email: email };
  const refresh_token = await generate_token(token_data, 'refresh_token');
  const access_token = await generate_token(token_data, 'access_token');
  // insert_token

  // i officially love TS now
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

export { user_login_controller };
