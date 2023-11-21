import { Router, json } from "express";
import { privileged_user_auth } from "../../middlewares/privileged_user_auth";
import {
  user_register_controller,
  user_signup_controller,
} from "../../controllers/registration/user_controllers";
const user_registration_router = Router();

user_registration_router.use(json());
// INFO: this is exlusive for admins/employees only
user_registration_router.post(
  "/register",
  privileged_user_auth,
  user_register_controller,
);
user_registration_router.post("/signup", user_signup_controller);

export default user_registration_router;
