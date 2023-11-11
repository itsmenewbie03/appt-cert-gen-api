import { Router, json } from "express";
import { resident_list_controller } from "../../controllers/data/resident_controllers";
import { privileged_user_auth } from "../../middlewares/privileged_user_auth";
const resident_router = Router();

resident_router.use(json());

resident_router.post("/list", privileged_user_auth, resident_list_controller);

export default resident_router;
