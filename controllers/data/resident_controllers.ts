import type { Request, Response } from "express";
import {
  delete_resident_by_id,
  find_resident_by_id,
  get_all_resident,
  update_resident_by_id,
} from "../../services/resident_services";
import { ObjectId } from "mongodb";
import { ResidentSchema } from "../../models/Resident";
import { validate_object_id } from "../../utils/object_id_validator";

const resident_list_controller = async (req: Request, res: Response) => {
  const residents = await get_all_resident();
  if (!residents.length) {
    return res
      .status(400)
      .json({ message: "The resident database is currently empty." });
  }
  return res.status(200).json({
    message: "Resident databased retrieved successfully",
    data: residents,
  });
};

const resident_find_controller = async (req: Request, res: Response) => {
  const { resident_id } = req.body;
  if (!resident_id) {
    return res.status(400).json({ message: "The resident_id is required." });
  }
  const validated_resident_id = validate_object_id(resident_id);
  if (!validated_resident_id.success) {
    return res.status(400).json({ message: validated_resident_id.message });
  }
  const resident = await find_resident_by_id(validated_resident_id.object_id);
  if (!resident.length) {
    return res.status(404).json({
      message: "No resident with the provided id exists in the database.",
    });
  }
  return res
    .status(200)
    .json({ message: "Resident found successfully", data: resident[0] });
};

const resident_update_controller = async (req: Request, res: Response) => {
  const { resident_id, update } = req.body;
  if (!resident_id || !update) {
    return res
      .status(400)
      .json({ message: "The resident_id and update is required." });
  }
  const validated_resident_id = validate_object_id(resident_id);
  if (!validated_resident_id.success) {
    return res.status(400).json({ message: validated_resident_id.message });
  }
  const update_schema = ResidentSchema.partial().strip();
  const parsed_update = update_schema.safeParse(update);
  if (!parsed_update.success) {
    return res.status(400).json({
      message: `The update data provided is not valid.`,
      cause: `${parsed_update.error.issues
        .map((val, i) => `${val.path.join("|")}: ${val.message}`)
        .join("; ")}.`,
    });
  }
  const update_result = await update_resident_by_id(
    validated_resident_id.object_id,
    parsed_update.data,
  );
  if (!update_result.acknowledged || !update_result.modifiedCount) {
    return res
      .status(400)
      .json({ message: "No data is updated in the database." });
  }
  return res.status(200).json({ message: "Resident updated successfully." });
};

const resident_delete_controller = async (req: Request, res: Response) => {
  const { resident_id } = req.body;
  if (!resident_id) {
    return res.status(400).json({ message: "The resident_id is required." });
  }
  const validated_resident_id = validate_object_id(resident_id);
  if (!validated_resident_id.success) {
    return res.status(400).json({ message: validated_resident_id.message });
  }
  const resident = await find_resident_by_id(validated_resident_id.object_id);
  if (!resident.length) {
    return res.status(404).json({
      message: "No resident with the provided id exists in the database.",
    });
  }
  const delete_result = await delete_resident_by_id(
    validated_resident_id.object_id,
  );
  if (!delete_result.acknowledged || !delete_result.deletedCount) {
    return res
      .status(400)
      .json({ message: "No resident was deleted from the database." });
  }
  return res.status(200).json({ message: "Resident deleted successfully." });
};

export {
  resident_list_controller,
  resident_find_controller,
  resident_update_controller,
  resident_delete_controller,
};
