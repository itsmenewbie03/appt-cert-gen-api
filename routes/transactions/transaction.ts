import { Router, json } from 'express';
import { auth } from '../../middlewares/auth';
import {
  appointment_list_controller,
  appointment_update_controller,
  appointment_delete_controller,
  appointment_create_controller,
  user_appointment_list_controller,
} from '../../controllers/transactions/appointment_controllers';
import { privileged_user_auth } from '../../middlewares/privileged_user_auth';
const transaction_router = Router();

transaction_router.use(json());
transaction_router.post('/create', auth, appointment_create_controller);

// NOTE: for this endpoint is for admin,
// a separate endpoint for retreiving personal appointments will be added
transaction_router.get(
  '/list',
  privileged_user_auth,
  appointment_list_controller,
);

// NOTE: this endpoint would be for users to retreive their personal appointments
transaction_router.get('/user/list', auth, user_appointment_list_controller);

transaction_router.patch(
  '/update',
  privileged_user_auth,
  appointment_update_controller,
);

transaction_router.delete(
  '/delete',
  privileged_user_auth,
  appointment_delete_controller,
);

export default transaction_router;
