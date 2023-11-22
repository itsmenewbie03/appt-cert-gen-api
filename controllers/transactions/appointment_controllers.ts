import type { Request, Response } from "express";
import { validate_object_id } from "../../utils/object_id_validator";
import { find_user_by } from "../../services/user_services";
import { Transaction, TransactionSchema } from "../../models/Transaction";
import {
  add_new_transaction,
  get_all_transaction,
} from "../../services/transaction_services";
/**
 * This controller is for handling user requested appointment
 * */
const create_appointment_controller = async (req: Request, res: Response) => {
  // HACK: the user_id won't be provided
  // we need to pull it from the email prop of access_token

  // INFO: Validate the document_id provied
  const { document_id } = req.body;
  if (!document_id) {
    return res
      .status(400)
      .json({ message: "Please provide all the required data." });
  }
  const validated_document_id = validate_object_id(document_id);
  if (!validated_document_id.success) {
    return res.status(400).json({ message: validated_document_id.message });
  }

  // INFO: fetch user_id from email
  const email = req.headers["email"] as string;
  const user = await find_user_by({ email });

  // NOTE: this would be weird if this code executes
  if (!user.length) {
    return res
      .status(404)
      .json({ message: "The user is not found in the database" });
  }
  // INFO: we have access to user_id now
  const { _id: user_id } = user[0];

  const appointment_schema = TransactionSchema.strip().omit({
    status: true,
    user_id: true,
    document_id: true,
  });

  const parsed_appointment_data = appointment_schema.safeParse(req.body);
  if (!parsed_appointment_data.success) {
    return res.status(400).json({
      message: `The appointment data provided is not valid.`,
      cause: `${parsed_appointment_data.error.issues
        .map((val, i) => `${val.path.join("|")}: ${val.message}`)
        .join("; ")}.`,
    });
  }
  // HACK: magic xD
  const appointment_data: Transaction = {
    status: "pending",
    user_id: user_id,
    document_id: document_id,
    ...parsed_appointment_data.data,
  };
  const result = await add_new_transaction(appointment_data);
  if (!result.acknowledged || !result.insertedId) {
    return res.status(500).json({
      message:
        "An error is encountered while trying to store data to the database.",
    });
  }
  return res.status(200).json({ message: "Appointment created successfully." });
};

const appointment_list_controller = async (req: Request, res: Response) => {
  const appointments = await get_all_transaction();
  if (!appointments.length) {
    return res
      .status(404)
      .json({ message: "The appointments database is currently empty." });
  }
  return res.status(200).json({
    message: "Appoinments retrieved successfully.",
    data: appointments,
  });
};
export { create_appointment_controller, appointment_list_controller };
