import { database } from '../db/mongo';
import { Transaction } from '../models/Transaction';
import { find_user_by_id } from './user_services';
import { Notification } from '../models/Notification';
import { find_document_by_id } from './document_services';
import { Collection, ObjectId } from 'mongodb';

const add_new_notification = async (transaction_data: Transaction) => {
  // TODO: get email from user_id and return [] if no users is found
  // never trust the users
  const { user_id, status, document_id } = transaction_data;
  const users = await find_user_by_id(user_id);
  if (!users.length) {
    console.log('no users found');
    return false;
  }
  const { email } = users[0];
  // TODO: get document type return false if no document is found
  // never trust the users
  const documents = await find_document_by_id(document_id);
  if (!documents.length) {
    console.log('no documents found');
    return false;
  }
  const { type, requires_payment } = documents[0];
  const document_status_message =
    status === 'rejected' ? `has been ${status}` : `is now ${status}`;

  let message = `Your request for ${type} ${document_status_message}.`;

  // NOTE: this is kinda weird tbh, we are checking if the document is paid
  // does waiting for payment means that the document is paid?
  // anyways nvm xD
  if (requires_payment && status === 'waiting for payment') {
    const { price } = documents[0];
    message = `Your request for ${type} ${document_status_message}. Please prepare ${price} pesos for the payment.`;
  }
  const notification_data: Notification = {
    user_email: email,
    message,
    read: false,
    timestamp: new Date(),
  };
  return await database
    .collection('notifications')
    .insertOne(notification_data);
};

const get_all_notifications = async (user_email: string) => {
  const notifications: Collection<Notification> =
    database.collection('notifications');
  // NOTE: we will return the notifications in descending order
  // based on the timestamp
  return await notifications
    .find({ user_email })
    .sort({ timestamp: -1 })
    .toArray();
};

const mark_notification_as_read = async (
  notification_id: ObjectId,
): Promise<{ success: boolean; message: string }> => {
  const notifications: Collection<Notification> =
    database.collection('notifications');
  const notification = await notifications
    .find({ _id: notification_id })
    .toArray();
  if (!notification.length) {
    return { success: false, message: 'Notification not found' };
  }
  const { read } = notification[0];
  if (read) {
    return { success: false, message: 'Notification is already read.' };
  }
  const update_result = await notifications.updateOne(
    { _id: notification_id },
    { $set: { read: true } },
  );
  if (!update_result.acknowledged || !update_result.modifiedCount) {
    return { success: false, message: 'Failed to mark notification as read.' };
  }
  return { success: true, message: 'Notification is now marked read.' };
};

export {
  add_new_notification,
  get_all_notifications,
  mark_notification_as_read,
};
