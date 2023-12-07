import type { ResidentData } from "../models/Resident";
import { database } from "../db/mongo";
import type { Collection, ObjectId } from "mongodb";
import { find_user_by_id } from "./user_services";
const add_new_resident = async (resident_data: ResidentData) => {
  return await database.collection("residents").insertOne(resident_data);
};
const get_all_resident = async () => {
  const residents: Collection<ResidentData> = database.collection("residents");
  return residents.find().toArray();
};

const find_resident_by_id = async (resident_id: ObjectId) => {
  const residents: Collection<ResidentData> = database.collection("residents");
  return residents.find({ _id: resident_id }).toArray();
};

const find_resident_by_user_id = async (user_id: ObjectId) => {
  const users = await find_user_by_id(user_id);
  if (!users.length) {
    return [];
  }
  const { resident_data_id } = users[0];
  if (!resident_data_id) {
    return [];
  }
  const residents: Collection<ResidentData> = database.collection("residents");
  return residents.find({ _id: resident_data_id }).toArray();
};
const update_resident_by_id = async (
  resident_id: ObjectId,
  update: Partial<ResidentData>,
) => {
  return await database
    .collection("residents")
    .updateOne({ _id: resident_id }, { $set: { ...update } });
};

const delete_resident_by_id = async (resident_id: ObjectId) => {
  return await database.collection("residents").deleteOne({ _id: resident_id });
};

export {
  add_new_resident,
  get_all_resident,
  find_resident_by_id,
  find_resident_by_user_id,
  update_resident_by_id,
  delete_resident_by_id,
};
