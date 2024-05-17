import { Router, json } from 'express';
import {
  document_create_controller,
  document_delete_controller,
  document_generate_controller,
  document_list_controller,
  walk_in_document_generate_controller,
} from '../../controllers/documents/document_controllers';
import { auth } from '../../middlewares/auth';
import { privileged_user_auth } from '../../middlewares/privileged_user_auth';

const document_router = Router();
document_router.use(json({ limit: '5mb' }));

document_router.get('/list', auth, document_list_controller);

document_router.post(
  '/create',
  privileged_user_auth,
  document_create_controller,
);

document_router.post(
  '/generate',
  privileged_user_auth,
  document_generate_controller,
);

document_router.post(
  '/walkin/generate',
  privileged_user_auth,
  walk_in_document_generate_controller,
);

document_router.delete(
  '/delete',
  privileged_user_auth,
  document_delete_controller,
);

export default document_router;
