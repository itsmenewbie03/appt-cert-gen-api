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
const add_new_document = async (document_data: Document) => {
  return await database.collection("documents").insertOne(document_data);
};
export { get_all_documents, find_document_by_id, add_new_document };
