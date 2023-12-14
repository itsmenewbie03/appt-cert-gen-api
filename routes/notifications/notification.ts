import { Router, json } from "express";
import { auth } from "../../middlewares/auth";
import { user_notification_list_controller } from "../../controllers/notifications/notification_controllers";

const notifications_router = Router();
notifications_router.get("/list", auth, user_notification_list_controller);
export default notifications_router;
