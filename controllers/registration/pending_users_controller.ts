import type { Request, Response } from "express";
import { get_all_pending_user_with_info } from "../../services/pending_user_services";

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

export { pending_user_list_controller };
