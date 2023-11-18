import type { Document } from "../models/Document";
import { database } from "../db/mongo";
import type { Collection } from "mongodb";

const get_all_documents = async () => {
  const documents: Collection<Document> = database.collection("documents");
  return documents.find({}).toArray();
};
export { get_all_documents };
