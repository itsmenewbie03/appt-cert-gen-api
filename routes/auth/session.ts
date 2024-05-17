import { Router, json } from 'express';
import {
  session_refresh_controller,
  session_logout_controller,
  session_status_controller,
} from '../../controllers/auth/session_controllers';
import { auth } from '../../middlewares/auth';

const session_router = Router();

session_router.use(json());

session_router.get('/refresh', session_refresh_controller);

session_router.post('/logout', session_logout_controller);

session_router.get('/status', auth, session_status_controller);

export default session_router;
