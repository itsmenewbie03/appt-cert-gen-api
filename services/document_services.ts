import type { Document } from "../models/Document";
import { database } from "../db/mongo";
import { Collection, ObjectId } from "mongodb";

const get_all_documents = async () => {
  const documents: Collection<Document> = database.collection("documents");
  return await documents.find({}).toArray();
};

const find_document_by_id = async (document_id: ObjectId) => {
  const documents: Collection<Document> = database.collection("documents");
  return await documents.find({ _id: document_id }).toArray();
};
export { get_all_documents, find_document_by_id };
