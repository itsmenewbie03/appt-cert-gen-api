import { Router, json } from "express";
import { document_list_controller } from "../../controllers/documents/document_controllers";
import { auth } from "../../middlewares/auth";

const document_router = Router();
document_router.use(json());
document_router.use(auth);

document_router.get("/list", document_list_controller);

export default document_router;
