import type { Request, Response } from "express";
import { get_all_documents } from "../../services/document_services";
import { validate_document_template } from "../../utils/document_template_validator";
import { RequiredDataSchema } from "../../models/Document";

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

  console.log("YAY we GOT:", JSON.stringify(body));
  return res.status(200).json(body);
};

export { document_list_controller, document_create_controller };
