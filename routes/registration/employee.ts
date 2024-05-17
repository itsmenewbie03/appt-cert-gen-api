import { Router, json } from 'express';
import { admin_auth } from '../../middlewares/admin_auth';
import { employee_register_controller } from '../../controllers/registration/employee_controllers';
const employee_registration_router = Router();

employee_registration_router.use(json());
employee_registration_router.use(admin_auth);
employee_registration_router.post('/register', employee_register_controller);

export default employee_registration_router;
