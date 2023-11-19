import { database } from "../db/mongo";
import type { Collection, ObjectId } from "mongodb";
import { Transaction } from "../models/Transaction";

const add_new_transaction = async (transaction_data: Transaction) => {
  return database.collection("transactions").insertOne(transaction_data);
};

export { add_new_transaction };
