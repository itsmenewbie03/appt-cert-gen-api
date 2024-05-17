import type { ResidentData } from '../models/Resident';
import { database } from '../db/mongo';
import type { Collection, ObjectId } from 'mongodb';
const add_new_pending_resident = async (resident_data: ResidentData) => {
  return await database
    .collection('pending_residents')
    .insertOne(resident_data);
};
const get_all_pending_resident = async () => {
  const residents: Collection<ResidentData> =
    database.collection('pending_residents');
  return residents.find().toArray();
};

const find_pending_resident_by_id = async (resident_id: ObjectId) => {
  const residents: Collection<ResidentData> =
    database.collection('pending_residents');
  return residents.find({ _id: resident_id }).toArray();
};

const update_pending_resident_by_id = async (
  resident_id: ObjectId,
  update: Partial<ResidentData>,
) => {
  return await database
    .collection('pending_residents')
    .updateOne({ _id: resident_id }, { $set: { ...update } });
};

const delete_pending_resident_by_id = async (resident_id: ObjectId) => {
  return await database
    .collection('pending_residents')
    .deleteOne({ _id: resident_id });
};

export {
  add_new_pending_resident,
  get_all_pending_resident,
  find_pending_resident_by_id,
  update_pending_resident_by_id,
  delete_pending_resident_by_id,
};
