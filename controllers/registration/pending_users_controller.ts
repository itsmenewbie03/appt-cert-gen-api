import type { Request, Response } from "express";
import {
  delete_pending_user_by_id,
  find_pending_user_by_id,
  get_all_pending_user_with_info,
} from "../../services/pending_user_services";
import { validate_object_id } from "../../utils/object_id_validator";
import { add_new_user } from "../../services/user_services";
import {
  delete_pending_resident_by_id,
  find_pending_resident_by_id,
} from "../../services/pending_resident_services";
import { add_new_resident } from "../../services/resident_services";

const pending_user_list_controller = async (req: Request, res: Response) => {
  const pending_users = await get_all_pending_user_with_info();
  if (!pending_users.length) {
    return res
      .status(400)
      .json({ message: "The pending user database is currently empty." });
  }
  return res.status(200).json({
    message: "Pending user databased retrieved successfully",
    data: pending_users,
  });
};

// TODO: refactor dizz
const pending_user_approve_controller = async (req: Request, res: Response) => {
  const { id } = req.body;
  if (!id) {
    return res
      .status(400)
      .json({ message: "Missing required parameter 'id'." });
  }
  const validated_id = validate_object_id(id);
  if (!validated_id.success) {
    return res.status(400).json({ message: validated_id.message });
  }
  const pending_user = await find_pending_user_by_id(validated_id.object_id);
  if (!pending_user.length) {
    return res.status(404).json({
      message:
        "No user with provided id is found in the pending user database.",
    });
  }
  // NOTE: this will be a weird case but yeah trust issues xD
  if (!pending_user[0].resident_data_id) {
    return res.status(500).json({
      message:
        "This is weird, please report to the admin, the user data is missing the key to pending resident database",
    });
  }

  const pending_resident_data = await find_pending_resident_by_id(
    pending_user[0].resident_data_id,
  );
  // NOTE: again this will be another weird case xD
  if (!pending_resident_data.length) {
    return res.status(500).json({
      message:
        "This is weird, please report to the admin, the user data provided a key that does not correspond to any data in the resident database.",
    });
  }
  // INFO: uploading to the main collection
  const result = await add_new_user(pending_user[0]);
  console.log(
    `DEBUG: the result after inserting new user to db ${JSON.stringify(
      result,
    )}`,
  );
  if (!result.acknowledged || !result.insertedId) {
    return res.status(500).json({
      message:
        "An error is encountered while trying to store data to the database.",
    });
  }
  const add_new_resident_result = await add_new_resident(
    pending_resident_data[0],
  );
  if (
    !add_new_resident_result.acknowledged ||
    !add_new_resident_result.insertedId
  ) {
    return res.status(500).json({
      message: "Failed to insert resident's info to the database",
    });
  }

  // INFO: deleting the data stored in pending collection
  const delete_pending_user_result = await delete_pending_user_by_id(
    validated_id.object_id,
  );
  if (
    !delete_pending_user_result.acknowledged ||
    !delete_pending_user_result.deletedCount
  ) {
    return res.status(400).json({
      message: "No user was deleted from the pending user database.",
    });
  }
  const delete_pending_resident_result = await delete_pending_resident_by_id(
    pending_user[0].resident_data_id,
  );
  if (
    !delete_pending_resident_result.acknowledged ||
    !delete_pending_resident_result.deletedCount
  ) {
    return res.status(400).json({
      message: "No resident was deleted from the pending resident database.",
    });
  }
  return res
    .status(200)
    .json({ message: "Pending user approved successfully." });
};

export { pending_user_list_controller, pending_user_approve_controller };
