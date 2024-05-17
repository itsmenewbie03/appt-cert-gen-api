import { ObjectId } from 'mongodb';

interface SuccessResponse {
  success: true;
  object_id: ObjectId;
}

interface ErrorResponse {
  success: false;
  message: string;
}

type ValidationResponse = SuccessResponse | ErrorResponse;

const validate_object_id = (object_id: string): ValidationResponse => {
  if (object_id.length !== 24) {
    return {
      success: false,
      message: 'The id must be 24 characters long.',
    };
  }
  const hex_string_rx = /^[a-fA-F0-9]+$/;
  if (!hex_string_rx.test(object_id)) {
    return { success: false, message: 'The id must be a hex string.' };
  }
  return { success: true, object_id: new ObjectId(object_id) };
};

export { validate_object_id };
