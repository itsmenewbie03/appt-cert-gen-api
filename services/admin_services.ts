import { database } from "../db/mongo";
import type { Admin } from "../models/Admin";
import type { Collection } from "mongodb";

const find_admin_by = async (admin_query: Partial<Admin>) => {
  const admins: Collection<Admin> = database.collection("admins");
  const admin_data = await admins
    .find({ ...admin_query }, { projection: { _id: 0 } })
    .toArray();
  return admin_data;
};
const update_admin_by = async (
  admin_query: Partial<Admin>,
  admin_data: Partial<Admin>,
) => {
  const admins: Collection<Admin> = database.collection("admins");
  const update_result = await admins.updateOne(
    { ...admin_query },
    { $set: { ...admin_data } },
  );
  return update_result;
};

export { find_admin_by, update_admin_by };
