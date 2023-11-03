import { Router, json } from "express";
import { admin_login_controller } from "../../controllers/auth/admin_controllers";

const admin_router = Router();

admin_router.use(json());

admin_router.post("/login", admin_login_controller);

export default admin_router;
