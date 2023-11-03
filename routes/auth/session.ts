import { Router, json } from "express";
import {
    session_refresh_controller,
    session_logout_controller,
} from "../../controllers/auth/session_controllers";

const session_router = Router();

session_router.use(json());

session_router.get("/refresh", session_refresh_controller);

session_router.post("/logout", session_logout_controller);

export default session_router;
