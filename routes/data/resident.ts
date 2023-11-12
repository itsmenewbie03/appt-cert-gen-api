import { Router, json } from "express";
import {
  resident_find_controller,
  resident_list_controller,
  resident_update_controller,
} from "../../controllers/data/resident_controllers";
import { privileged_user_auth } from "../../middlewares/privileged_user_auth";
const resident_router = Router();

resident_router.use(json());

resident_router.post("/list", privileged_user_auth, resident_list_controller);
resident_router.post("/find", privileged_user_auth, resident_find_controller);
// TODO: this update is currently exclusive to only employee/admin
// TODO: need to find way to allow resident to update their own data
resident_router.patch(
  "/update",
  privileged_user_auth,
  resident_update_controller,
);

export default resident_router;
