import { Router, json } from "express";
import {
  document_create_controller,
  document_list_controller,
} from "../../controllers/documents/document_controllers";
import { auth } from "../../middlewares/auth";
import { privileged_user_auth } from "../../middlewares/privileged_user_auth";

const document_router = Router();
document_router.use(json({ limit: "5mb" }));

document_router.get("/list", auth, document_list_controller);
document_router.post(
  "/create",
  privileged_user_auth,
  document_create_controller,
);

export default document_router;
