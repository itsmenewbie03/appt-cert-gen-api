import { database } from "../db/mongo";
import type { User } from "../models/User";
import type { Collection } from "mongodb";

const find_user_by = async (user_query: Partial<User>) => {
  const users: Collection<User> = database.collection("users");
  const user_data = await users.find({ ...user_query }).toArray();
  return user_data;
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

export { find_user_by, update_user_by };
