import type { Request, Response } from "express";
import { validate_object_id } from "../../utils/object_id_validator";
import { find_user_by, find_user_by_id } from "../../services/user_services";
import {
  Transaction,
  TransactionSchema,
  TransactionStatusSchema,
} from "../../models/Transaction";
import {
  add_new_transaction,
  find_transaction_by_id,
  get_all_transaction,
  update_transaction_by_id,
} from "../../services/transaction_services";
import { find_resident_by_id } from "../../services/resident_services";
import { find_document_by_id } from "../../services/document_services";
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
// BUG: this would be buggy but idc atm
// this is very dirty code i hate to write it but i don't have a choice
// gonna refactor soon xD
const appointment_list_controller = async (req: Request, res: Response) => {
  const data: any[] = [];
  const appointments = await get_all_transaction();

  for (const e of appointments) {
    const temp: any = { ...e };
    const user_data = await find_user_by_id(e.user_id);
    const { resident_data_id } = user_data[0];
    const resident_data = await find_resident_by_id(resident_data_id);
    const document_data = await find_document_by_id(e.document_id);
    temp["user_data"] = { ...resident_data[0] };
    temp["document_data"] = { ...document_data[0] };
    console.log(`DEBUG: pushing ${JSON.stringify(temp)}`);
    data.push(temp);
  }
  console.log(`DEBUG: data after the loop ${JSON.stringify(data)}`);
  if (!appointments.length) {
    return res
      .status(404)
      .json({ message: "The appointments database is currently empty." });
  }
  return res.status(200).json({
    message: "Appoinments retrieved successfully.",
    data: data,
  });
};

const appointment_update_controller = async (req: Request, res: Response) => {
  const { id, status } = req.body;
  if (!id || !status) {
    return res.status(400).json({ message: "Missing required parameters." });
  }
  const validated_id = validate_object_id(id);
  if (!validated_id.success) {
    return res.status(400).json({ message: validated_id.message });
  }
  const appointment = await find_transaction_by_id(validated_id.object_id);
  if (!appointment.length) {
    return res.status(404).json({
      message: "No appoinment with the provided id is found on the database.",
    });
  }
  const validated_status = TransactionStatusSchema.safeParse(status);
  if (!validated_status.success) {
    return res.status(400).json({
      message: `The status provided is not valid.`,
      cause: `${validated_status.error.issues
        .map((val, i) => `${val.path.join("|")}: ${val.message}`)
        .join("; ")}.`,
    });
  }
  const update_result = await update_transaction_by_id(validated_id.object_id, {
    status: validated_status.data,
  });
  if (!update_result.acknowledged || !update_result.modifiedCount) {
    return res
      .status(500)
      .json({ message: "Failed to updated the appointment." });
  }
  return res
    .status(200)
    .json({ message: "Appointment status updated successfully." });
};

export {
  create_appointment_controller,
  appointment_list_controller,
  appointment_update_controller,
};
