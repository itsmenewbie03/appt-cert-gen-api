import { Router, json } from "express";
import { privileged_user_auth } from "../../middlewares/privileged_user_auth";
import { resident_register_controller } from "../../controllers/registration/resident_controllers";
const resident_registration_router = Router();

resident_registration_router.use(json());

// INFO: this is exlusive for admins/employees only
resident_registration_router.post(
  "/register",
  privileged_user_auth,
  resident_register_controller,
);

export default resident_registration_router;
