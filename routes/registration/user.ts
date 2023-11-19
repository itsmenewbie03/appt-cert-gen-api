import { Router, json } from "express";
import { privileged_user_auth } from "../../middlewares/privileged_user_auth";
import { user_register_controller } from "../../controllers/registration/user_controllers";
const user_registration_router = Router();

user_registration_router.use(json());
user_registration_router.use(privileged_user_auth);
user_registration_router.post("/register", user_register_controller);

export default user_registration_router;
