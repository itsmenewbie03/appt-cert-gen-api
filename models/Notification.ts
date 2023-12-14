import { z } from "zod";
// NOTE: we are going to use user's email to as foregin key to the user collection
const NotificationSchema = z.object({
  user_email: z.string(),
  message: z.string(),
  timestamp: z.coerce.date(),
  read: z.boolean(),
});

type Notification = z.infer<typeof NotificationSchema>;
export { Notification, NotificationSchema };
