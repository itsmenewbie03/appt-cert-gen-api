import PasswordValidator from 'password-validator';

const schema = new PasswordValidator();

schema
  .is()
  .min(8)
  .is()
  .max(100)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits(1)
  .has()
  .symbols()
  .has()
  .not()
  .spaces();
/**
 *
 * @param password
 * @returns an array of object that tell why the password failed the evaluation or an empty array if the password is valid
 */
const evaluate_password = (password: string): any[] => {
  //@ts-ignore
  return schema.validate(password, { details: true });
};

export default evaluate_password;
