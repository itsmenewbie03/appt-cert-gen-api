import type { Request, Response } from "express";
import { get_all_documents } from "../../services/document_services";

const document_list_controller = async (req: Request, res: Response) => {
  const documents = await get_all_documents();
  if (!documents.length) {
    return res
      .status(400)
      .json({ message: "No documents are found in the database" });
  }
  return res
    .status(200)
    .json({ message: "Documents retrieved successfully", data: documents });
};

export { document_list_controller };
