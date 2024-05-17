import type { Request, Response } from 'express';
import {
  get_all_notifications,
  mark_notification_as_read,
} from '../../services/notification_services';
import { validate_object_id } from '../../utils/object_id_validator';

const user_notification_list_controller = async (
  req: Request,
  res: Response,
) => {
  // TODO: we will use the email passed in the headers
  const email = req.headers['email'] as string;
  const notifications = await get_all_notifications(email);
  if (!notifications.length) {
    return res.status(400).json({ message: 'You have no notifications' });
  }
  return res.status(200).json({
    message: 'Notifications retrieved successfully',
    data: notifications,
  });
};

const mark_notification_as_read_controller = async (
  req: Request,
  res: Response,
) => {
  const { notification_id } = req.body;
  if (!notification_id) {
    return res.status(400).json({ message: 'Notification ID is required' });
  }
  // NOTE: validate notification_id
  const validated_notification_id = validate_object_id(notification_id);
  if (!validated_notification_id.success) {
    return res.status(400).json({ message: validated_notification_id.message });
  }
  const { success, message } = await mark_notification_as_read(
    validated_notification_id.object_id,
  );
  if (!success) {
    return res.status(400).json({ message });
  }
  return res.status(200).json({ message });
};

export {
  user_notification_list_controller,
  mark_notification_as_read_controller,
};
