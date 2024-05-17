import { Router, json } from 'express';
import { privileged_user_auth } from '../../middlewares/privileged_user_auth';
import {
  pending_user_approve_controller,
  pending_user_list_controller,
  pending_user_reject_controller,
} from '../../controllers/registration/pending_users_controller';
const pending_user_router = Router();

pending_user_router.use(json());
pending_user_router.use(privileged_user_auth);

// INFO: this is exlusive for admins/employees only
pending_user_router.get('/list', pending_user_list_controller);
pending_user_router.post('/approve', pending_user_approve_controller);
pending_user_router.post('/reject', pending_user_reject_controller);

export default pending_user_router;
