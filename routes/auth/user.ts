import { Router, json } from 'express';
import { user_login_controller } from '../../controllers/auth/user_controllers';
const user_router = Router();

user_router.use(json());
user_router.post('/login', user_login_controller);

export default user_router;
