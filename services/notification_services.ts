import { database } from "../db/mongo";
import { Transaction } from "../models/Transaction";
import { find_user_by_id } from "./user_services";
import { Notification } from "../models/Notification";
import { find_document_by_id } from "./document_services";

const add_new_notification = async (transaction_data: Transaction) => {
  // TODO: get email from user_id and return [] if no users is found
  // never trust the users
  const { user_id, status, document_id } = transaction_data;
  const users = await find_user_by_id(user_id);
  if (!users.length) {
    console.log("no users found");
    return false;
  }
  const { email } = users[0];
  // TODO: get document type return false if no document is found
  // never trust the users
  const documents = await find_document_by_id(document_id);
  if (!documents.length) {
    console.log("no documents found");
    return false;
  }
  const { type } = documents[0];
  const document_status_message =
    status === "rejected" ? `has been ${status}` : `is now ${status}`;
  const message = `Your request for ${type} ${document_status_message}.`;

  const notification_data: Notification = {
    user_email: email,
    message,
    read: false,
    timestamp: new Date(),
  };
  return await database
    .collection("notifications")
    .insertOne(notification_data);
};

export { add_new_notification };
