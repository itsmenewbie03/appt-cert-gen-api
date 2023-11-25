import { database } from "../db/mongo";
import type { User } from "../models/User";
import type { Collection, ObjectId } from "mongodb";

const find_user_by = async (user_query: Partial<User>) => {
  const users: Collection<User> = database.collection("users");
  const user_data = await users.find({ ...user_query }).toArray();
  return user_data;
};

const find_user_by_id = async (user_id: ObjectId) => {
  const users: Collection<User> = database.collection("users");
  const user_data = await users.find({ _id: user_id }).toArray();
  return user_data;
};

const add_new_user = async (user_data: User) => {
  return await database.collection("users").insertOne(user_data);
};

const update_user_by = async (
  admin_query: Partial<User>,
  admin_data: Partial<User>,
) => {
  const users: Collection<User> = database.collection("users");
  const update_result = await users.updateOne(
    { ...admin_query },
    { $set: { ...admin_data } },
  );
  return update_result;
};

export { find_user_by, add_new_user, update_user_by, find_user_by_id };
