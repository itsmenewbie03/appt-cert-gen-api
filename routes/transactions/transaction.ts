import { Router, json } from "express";
import { auth } from "../../middlewares/auth";
import {
  appointment_list_controller,
  create_appointment_controller,
} from "../../controllers/transactions/appointment_controllers";
const transaction_router = Router();

transaction_router.use(json());
transaction_router.post("/create", auth, create_appointment_controller);
// NOTE: for this endpoint is for admin,
// a separate endpoint for retreiving personal appointments will be added
transaction_router.get("/list", auth, appointment_list_controller);

export default transaction_router;
