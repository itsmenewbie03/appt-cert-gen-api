import { Router, json } from "express";
import { employee_login_controller } from "../../controllers/auth/employee_controllers";

const employee_router = Router();

employee_router.use(json());

employee_router.post("/login", employee_login_controller);

export default employee_router;
