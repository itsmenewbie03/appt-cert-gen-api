import { database } from "../db/mongo";
import type { Collection, ObjectId } from "mongodb";
import { Transaction } from "../models/Transaction";

const add_new_transaction = async (transaction_data: Transaction) => {
  return database.collection("transactions").insertOne(transaction_data);
};

const find_transaction_by_id = async (transaction_id: ObjectId) => {
  const transactions: Collection<Transaction> =
    database.collection("transactions");
  return await transactions.find({ _id: transaction_id }).toArray();
};

const update_transaction_by_id = async (
  transaction_id: ObjectId,
  update: Partial<Transaction>,
) => {
  return await database
    .collection("transactions")
    .updateOne({ _id: transaction_id }, { $set: { ...update } });
};
const get_all_transaction = async () => {
  const transactions: Collection<Transaction> =
    database.collection("transactions");
  return await transactions.find({}).toArray();
};
export {
  add_new_transaction,
  get_all_transaction,
  find_transaction_by_id,
  update_transaction_by_id,
};
