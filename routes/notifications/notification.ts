import { Router, json } from "express";
import { auth } from "../../middlewares/auth";
import {
  mark_notification_as_read_controller,
  user_notification_list_controller,
} from "../../controllers/notifications/notification_controllers";

const notifications_router = Router();
notifications_router.get("/list", auth, user_notification_list_controller);
notifications_router.patch(
  "/mark_as_read",
  json(),
  auth,
  mark_notification_as_read_controller,
);
export default notifications_router;
