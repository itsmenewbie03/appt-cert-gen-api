import type { Request, Response, NextFunction } from 'express';
import { verify_token } from '../utils/jwt';

const auth = async (req: Request, res: Response, next: NextFunction) => {
  const error_codes = [
    'ERR_JWT_EXPIRED',
    'ERR_JWS_INVALID',
    'ERR_JWS_SIGNATURE_VERIFICATION_FAILED',
  ];
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({
      message:
        'You are not authorized to access this resource. Wanna go to jail?',
    });
  }
  const token = /(?<=Bearer\s)(.*)/g.exec(authorization)?.[0];
  if (!token) {
    return res.status(403).json({
      message: "So you're a bit of a hacker huh? You can do better.",
    });
  }
  const token_data = await verify_token(token, 'access_token').catch(
    (err) => err.code,
  );
  // check if ERR_JWS_INVALID || ERR_JWT_EXPIRED || ERR_JWS_SIGNATURE_VERIFICATION_FAILED
  if (error_codes.includes(token_data)) {
    return res.status(403).json({
      message: "So you're persistent huh? Maybe you could actually do it.",
    });
  }
  if (!token_data?.payload?.email || !token_data?.payload?.role) {
    return res.status(400).json({
      message:
        'The token provided does contain all the needed information to complete the request.',
    });
  }
  req.headers['email'] = token_data.payload.email;
  req.headers['role'] = token_data.payload.role;
  next();
};
export { auth };
