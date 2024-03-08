import type { Request, Response } from "express";
import { ResidentSchema } from "../../models/Resident";
import {
  add_new_resident,
  find_resident_by,
  find_resident_by_id,
} from "../../services/resident_services";

const resident_register_controller = async (req: Request, res: Response) => {
  const { info } = req.body;

  if (!info) {
    return res
      .status(400)
      .json({ message: "Invalid request, please use your brain." });
  }

  const resident_validator = ResidentSchema.strip();
  const resident_data_parsed = resident_validator.safeParse(info);

  if (!resident_data_parsed.success) {
    return res.status(400).json({
      message: `The resident data provided is not valid.`,
      cause: `${resident_data_parsed.error.issues
        .map((val, i) => `${val.path.join("|")}: ${val.message}`)
        .join("; ")}.`,
    });
  }
  const { first_name, last_name, date_of_birth } = resident_data_parsed.data;

  const possible_match = await find_resident_by({
    first_name,
    last_name,
    date_of_birth,
  });

  if (possible_match.length) {
    return res.status(400).json({ message: "Resident already exists." });
  }

  const add_new_resident_result = await add_new_resident(
    resident_data_parsed.data,
  );

  if (
    !add_new_resident_result.acknowledged ||
    !add_new_resident_result.insertedId
  ) {
    return res.status(500).json({
      message: "Failed to insert resident's info to the database",
    });
  }

  return res.status(200).json({ message: "Resident registered successfully." });
};

export { resident_register_controller };
