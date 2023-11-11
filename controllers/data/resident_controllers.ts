import type { Request, Response } from "express";
import { get_all_resident } from "../../services/resident_services";

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
/**
 * TODO:
 * use ObjectID to indentify the resident
 * implement update controller
 * implement delete controller
 * implement find controller
 **/
export { resident_list_controller };
