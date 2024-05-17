interface SuccessResponse {
  success: true;
  challenge_ts: string;
  hostname: string;
  score: number;
  action: string;
}

interface FailureResponse {
  success: false;
  'error-codes': string[];
}

type RecaptchaVerificationResponse = SuccessResponse | FailureResponse;

const validate_recaptcha = async (
  token: string,
): Promise<RecaptchaVerificationResponse> => {
  const endpoint = `https://www.google.com/recaptcha/api/siteverify`;
  const opts = {
    method: 'POST',
    body: `secret=${process.env.RECAPTCHA_SECRET}&response=${token}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  console.log(`DEBUG: opts is ${JSON.stringify(opts)}`);
  const resp = await fetch(endpoint, opts).then((res) => res.json());
  return resp as RecaptchaVerificationResponse;
};

export { validate_recaptcha };
