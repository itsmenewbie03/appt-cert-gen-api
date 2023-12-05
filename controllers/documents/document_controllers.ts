import type { Request, Response } from "express";
import {
  add_new_document,
  get_all_documents,
} from "../../services/document_services";
import { validate_document_template } from "../../utils/document_template_validator";
import { Document, RequiredDataSchema } from "../../models/Document";
import { upload } from "../../utils/file_host";

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

const document_create_controller = async (req: Request, res: Response) => {
  const body = req.body;
  const { file, required_data, document_name, document_type } = body;
  if (!file || !required_data || !document_name || !document_type) {
    return res.status(400).json({ message: "Missing required parameters." });
  }
  // INFO: we now parse the file
  const template_buffer = Buffer.from(file, "base64");
  // INFO: validate the `required_data` prop
  const required_data_validation = RequiredDataSchema.safeParse(required_data);
  console.log(
    `WE GOT: required_data ${required_data} and the validation returns ${required_data_validation}`,
  );
  if (!required_data_validation.success) {
    return res.status(400).json({
      message: `The required_data provided is not valid.`,
      cause: `${required_data_validation.error.issues
        .map((val, _i) => `${val.path.join("|")}: ${val.message}`)
        .join("; ")}.`,
    });
  }
  // INFO: check if the template matches the provided required_data
  // this is done to ensure that the user actually provided a valid template
  const valid_template = await validate_document_template(
    template_buffer,
    required_data_validation.data,
  );
  if (!valid_template) {
    return res.status(400).json({
      message:
        "The document template provided does not match with the required_data provided.",
    });
  }
  // INFO: we can now upload the file to the file hosting and add a new `document` to the `documents` collections
  // NOTE: this automatically sets the file extension to .docx if this causes trouble then we fix thix in producion xD
  const file_name = `${document_name.replace(/\s+/g, "_")}.docx`;
  console.log(`FILENAME FOR UPLOAD: ${file_name}`);
  const file_path = await upload(template_buffer, file_name);
  if (!file_path) {
    return res.status(500).json({
      message:
        "There was a problem trying to upload the template to the storage. Please try again later or contact the technical team.",
    });
  }
  // INFO: uploading the document to the database
  const document_data: Document = {
    type: document_name as string,
    requires_payment: document_type === "paid",
    required_data: required_data_validation.data,
    file_path: file_path,
  };
  const insert_result = await add_new_document(document_data);
  if (!insert_result.acknowledged || !insert_result.insertedId) {
    return res.status(500).json({
      message:
        "There was a problem trying to upload to the database. Please try again later or contact the technical team.",
    });
  }
  return res
    .status(200)
    .json({ message: "Document template addedd successfully." });
};

export { document_list_controller, document_create_controller };
