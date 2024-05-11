import { Router, json } from "express";
import {
  resident_delete_controller,
  resident_find_controller,
  resident_list_controller,
  resident_update_controller,
} from "../../controllers/data/resident_controllers";
import { privileged_user_auth } from "../../middlewares/privileged_user_auth";
const resident_router = Router();

resident_router.use(json());

resident_router.get("/list", privileged_user_auth, resident_list_controller);
resident_router.post("/find", privileged_user_auth, resident_find_controller);
// TODO: this update is exclusive only to employee/admin
// this is done to prevent users from altering their data
resident_router.patch(
  "/update",
  privileged_user_auth,
  resident_update_controller,
);
resident_router.delete(
  "/delete",
  privileged_user_auth,
  resident_delete_controller,
);

// NOTE: this only to support android client
// since overriding the method is too much
// so the backend will compoenstate for it xD
resident_router.post(
  "/delete",
  privileged_user_auth,
  resident_delete_controller,
);

export default resident_router;
