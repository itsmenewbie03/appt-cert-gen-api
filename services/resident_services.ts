import type { ResidentData } from "../models/Resident";
import { database } from "../db/mongo";
import type { ObjectId } from "mongodb";
const add_new_resident = async (resident_data: ResidentData) => {
  return await database.collection("residents").insertOne(resident_data);
};
const get_all_resident = async () => {
  return await database.collection("residents").find().toArray();
};

const find_resident_by_id = async (resident_id: ObjectId) => {
  return await database
    .collection("residents")
    .find({ _id: resident_id })
    .toArray();
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
  update_resident_by_id,
  delete_resident_by_id,
};
