import { Router, json } from 'express';
import { privileged_user_auth } from '../../middlewares/privileged_user_auth';
import { user_find_controller } from '../../controllers/data/user';
const user_data_router = Router();

user_data_router.use(json());

user_data_router.post('/find', privileged_user_auth, user_find_controller);
export default user_data_router;
