import { Router, json } from "express";
import { privileged_user_auth } from "../../middlewares/privileged_user_auth";
import { generate_report_controller } from "../../controllers/transactions/reports_controllers";
const reports_router = Router();

reports_router.use(json());

reports_router.post(
  "/generate",
  privileged_user_auth,
  generate_report_controller,
);

export default reports_router;
