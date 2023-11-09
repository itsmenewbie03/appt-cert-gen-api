// Common properties for both success and failure responses
interface CommonResponse {
  success: boolean;
}

// Success response with additional properties
interface SuccessResponse extends CommonResponse {
  success: true;
  challenge_ts: string;
  hostname: string;
  score: number;
  action: string;
}

// Failure response with error codes
interface FailureResponse extends CommonResponse {
  success: false;
  "error-codes": string[];
}

// Combined type representing both success and failure scenarios
type RecaptchaVerificationResponse = SuccessResponse | FailureResponse;

const validate_recaptcha = async (
  token: string,
): Promise<RecaptchaVerificationResponse> => {
  const endpoint = `https://www.google.com/recaptcha/api/siteverify`;
  const opts = {
    method: "POST",
    body: `secret=${process.env.RECAPTCHA_SECRET}&response=${token}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  console.log(`DEBUG: opts is ${JSON.stringify(opts)}`);
  const resp = await fetch(endpoint, opts).then((res) => res.json());
  return resp as RecaptchaVerificationResponse;
};

export { validate_recaptcha };
