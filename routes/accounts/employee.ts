import { Router, json } from "express";
import { admin_auth } from "../../middlewares/admin_auth";
import { employee_delete_controller } from "../../controllers/auth/employee_controllers";

const employee_accounts_router = Router();

employee_accounts_router.use(json());
employee_accounts_router.use(admin_auth);

employee_accounts_router.delete("/delete", employee_delete_controller);

export default employee_accounts_router;
