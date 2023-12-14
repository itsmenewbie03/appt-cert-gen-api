import type { Request, Response } from "express";
import { get_all_notifications } from "../../services/notification_services";

const user_notification_list_controller = async (
  req: Request,
  res: Response,
) => {
  // TODO: we will use the email passed in the headers
  const email = req.headers["email"] as string;
  const notifications = await get_all_notifications(email);
  if (!notifications.length) {
    return res.status(400).json({ message: "You have no notifications" });
  }
  return res.status(200).json({
    message: "Notifications retrieved successfully",
    data: notifications,
  });
};
export { user_notification_list_controller };
