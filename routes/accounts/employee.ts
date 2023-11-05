import { Router, json } from "express";
import { admin_auth } from "../../middlewares/admin_auth";
import {
    employee_change_password_controller,
    employee_delete_controller,
    employee_update_controller,
} from "../../controllers/auth/employee_controllers";
import { auth } from "../../middlewares/auth";

const employee_accounts_router = Router();

employee_accounts_router.use(json());

employee_accounts_router.delete(
    "/delete",
    admin_auth,
    employee_delete_controller
);

employee_accounts_router.patch("/update", auth, employee_update_controller);

employee_accounts_router.patch(
    "/change_password",
    auth,
    employee_change_password_controller
);
export default employee_accounts_router;
