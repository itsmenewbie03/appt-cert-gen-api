import { Router, json } from 'express';
import { admin_auth } from '../../middlewares/admin_auth';
import { privileged_user_auth } from '../../middlewares/privileged_user_auth';
import {
  employee_avatar_update_controller,
  employee_change_password_controller,
  employee_data_controller,
  employee_delete_controller,
  employee_update_controller,
} from '../../controllers/auth/employee_controllers';

const employee_accounts_router = Router();

employee_accounts_router.use(json());

employee_accounts_router.delete(
  '/delete',
  admin_auth,
  employee_delete_controller,
);

employee_accounts_router.patch(
  '/update',
  privileged_user_auth,
  employee_update_controller,
);

// NOTE: this is to support android client
employee_accounts_router.post(
  '/update',
  privileged_user_auth,
  employee_update_controller,
);

employee_accounts_router.patch(
  '/change_password',
  privileged_user_auth,
  employee_change_password_controller,
);

// NOTE: this will handle the new avatar feature
employee_accounts_router.post(
  '/change_avatar',
  privileged_user_auth,
  employee_avatar_update_controller,
);

employee_accounts_router.get(
  '/info',
  privileged_user_auth,
  employee_data_controller,
);

export default employee_accounts_router;
