import { database } from '../db/mongo';
import type { User } from '../models/User';
import type { Collection, ObjectId } from 'mongodb';

const get_all_pending_user = async () => {
  const users: Collection<User> = database.collection('pending_users');
  const user_data = await users.find().toArray();
  return user_data;
};

const get_all_pending_user_with_info = async () => {
  const users: Collection<User> = database.collection('pending_users');
  const user_data = await users
    .aggregate([
      {
        $lookup: {
          from: 'pending_residents',
          localField: 'resident_data_id',
          foreignField: '_id',
          as: 'info',
        },
      },
    ])
    .toArray();
  return user_data;
};

const find_pending_user_by_id = async (pending_user_id: ObjectId) => {
  const users: Collection<User> = database.collection('pending_users');
  const user_data = await users.find({ _id: pending_user_id }).toArray();
  return user_data;
};

const delete_pending_user_by_id = async (pending_user_id: ObjectId) => {
  const users: Collection<User> = database.collection('pending_users');
  return await users.deleteOne({ _id: pending_user_id });
};

const add_new_pending_user = async (user_data: User) => {
  return await database.collection('pending_users').insertOne(user_data);
};

const update_pending_user_by = async (
  admin_query: Partial<User>,
  admin_data: Partial<User>,
) => {
  const users: Collection<User> = database.collection('pending_users');
  const update_result = await users.updateOne(
    { ...admin_query },
    { $set: { ...admin_data } },
  );
  return update_result;
};

export {
  find_pending_user_by_id,
  add_new_pending_user,
  update_pending_user_by,
  get_all_pending_user,
  get_all_pending_user_with_info,
  delete_pending_user_by_id,
};
