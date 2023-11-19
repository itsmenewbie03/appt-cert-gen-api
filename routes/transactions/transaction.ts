import { Router, json } from "express";
import { auth } from "../../middlewares/auth";
import { create_appointment_controller } from "../../controllers/transactions/appointment_controllers";
const transaction_router = Router();

transaction_router.use(json());
transaction_router.use(auth);
transaction_router.post("/create", create_appointment_controller);

export default transaction_router;
