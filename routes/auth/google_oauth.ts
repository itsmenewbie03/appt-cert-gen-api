import { Router, json } from "express";
import { auth } from "../../middlewares/auth";
import {
  google_oauth_bind_controller,
  google_oauth_login_controller,
} from "../../controllers/auth/google_oauth_controllers";
const google_oauth_router = Router();

google_oauth_router.use(json());

google_oauth_router.post("/bind", auth, google_oauth_bind_controller);

google_oauth_router.post("/login", google_oauth_login_controller);

export default google_oauth_router;
