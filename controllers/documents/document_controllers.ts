import type { Request, Response } from 'express';
import {
  add_new_document,
  delete_document_by_id,
  find_document_by_id,
  get_all_documents,
} from '../../services/document_services';
import { validate_document_template } from '../../utils/document_template_validator';
import { Document, RequiredDataSchema } from '../../models/Document';
import { download, upload } from '../../utils/file_host';
import { TransactionSchema, WalkInTransaction } from '../../models/Transaction';
import {
  add_new_resident,
  find_resident_by,
  find_resident_by_user_id,
} from '../../services/resident_services';
import {
  generate_document,
  generate_template_data,
} from '../../utils/document_generator';
import { validate_object_id } from '../../utils/object_id_validator';
import { ResidentData, ResidentSchema } from '../../models/Resident';
import { add_new_walkin_transaction } from '../../services/transaction_services';
import { ObjectId } from 'mongodb';
import {
  duration_to_seconds,
  get_age_in_seconds,
} from '../../utils/date_utils';

const document_list_controller = async (_req: Request, res: Response) => {
  const documents = await get_all_documents();
  if (!documents.length) {
    return res
      .status(400)
      .json({ message: 'No documents are found in the database' });
  }
  return res
    .status(200)
    .json({ message: 'Documents retrieved successfully', data: documents });
};

const document_create_controller = async (req: Request, res: Response) => {
  const { file, required_data, document_name, document_type, price } = req.body;
  if (!file || !required_data || !document_name || !document_type) {
    return res.status(400).json({ message: 'Missing required parameters.' });
  }
  // INFO: handly empty required_data
  // This is a bit stict but there should be no need to generate a certificate
  // in which no data is required
  if (!required_data.length) {
    return res
      .status(400)
      .json({ message: 'The required_data should not be empty.' });
  }

  // INFO: handle paid document
  const is_paid = document_type === 'paid';
  if (is_paid && !required_data.includes('or_number')) {
    return res.status(400).json({
      message:
        'The document is a paid document, but or_number is not present in required_data.',
    });
  }
  // INFO: handle paid document but no price provided
  if (is_paid && !price) {
    return res.status(400).json({
      message:
        'The document is a paid document, but no price is provided in the request body.',
    });
  }
  // INFO: we now parse the file
  const template_buffer = Buffer.from(file, 'base64');
  // INFO: validate the `required_data` prop but make it allow or_number to handle paid documents
  const required_data_validation = RequiredDataSchema.safeParse(required_data);
  console.log(
    `WE GOT: required_data ${required_data} and the validation returns ${required_data_validation}`,
  );
  if (!required_data_validation.success) {
    return res.status(400).json({
      message: `The required_data provided is not valid.`,
      cause: `${required_data_validation.error.issues
        .map((val, _i) => `${val.path.join('|')}: ${val.message}`)
        .join('; ')}.`,
    });
  }
  // INFO: check if the template matches the provided required_data
  // this is done to ensure that the user actually provided a valid template
  const valid_template = await validate_document_template(
    template_buffer,
    required_data_validation.data,
    is_paid,
  );
  if (!valid_template.success) {
    return res.status(400).json({
      message: valid_template.message,
    });
  }
  // INFO: we can now upload the file to the file hosting and add a new `document` to the `documents` collections
  // NOTE: this automatically sets the file extension to .docx if this causes trouble then we fix thix in producion xD
  const file_name = `${document_name.replace(/\s+/g, '_')}.docx`;
  console.log(`FILENAME FOR UPLOAD: ${file_name}`);
  const file_path = await upload(template_buffer, file_name);
  if (!file_path) {
    return res.status(500).json({
      message:
        'There was a problem trying to upload the template to the storage. Please try again later or contact the technical team.',
    });
  }

  // INFO: uploading the document to the database
  // it's been a while since i wrote an else statement xD
  let document_data: Document;
  if (is_paid) {
    document_data = {
      type: document_name as string,
      requires_payment: is_paid,
      required_data: required_data_validation.data,
      file_path: file_path,
      price: price as number,
    };
  } else {
    document_data = {
      type: document_name as string,
      requires_payment: is_paid,
      required_data: required_data_validation.data,
      file_path: file_path,
    };
  }

  const insert_result = await add_new_document(document_data);
  if (!insert_result.acknowledged || !insert_result.insertedId) {
    return res.status(500).json({
      message:
        'There was a problem trying to upload to the database. Please try again later or contact the technical team.',
    });
  }
  return res
    .status(200)
    .json({ message: 'Document template addedd successfully.' });
};

// NOTE: PLEASE REVIEW THIS
const document_generate_controller = async (req: Request, res: Response) => {
  // TODO: take an Object of type Transaction
  const parsed_body = TransactionSchema.omit({
    user_id: true,
    document_id: true,
  }).safeParse(req.body);
  if (!parsed_body.success) {
    return res.status(400).json({
      message: `The request body provided is not valid.`,
      cause: `${parsed_body.error.issues
        .map((val, _i) => `${val.path.join('|')}: ${val.message}`)
        .join('; ')}.`,
    });
  }
  // INFO: here we go in parsing the data coz we choose this hell xD
  const { user_id, document_id } = req.body;
  // INFO: validate if the user_id
  const validate_user_id = validate_object_id(user_id);
  if (!validate_user_id.success) {
    return res.status(400).json({ message: validate_user_id.message });
  }
  // INFO: validate if the document_id
  const validate_document_id = validate_object_id(document_id);
  if (!validate_document_id.success) {
    return res.status(400).json({ message: validate_document_id.message });
  }
  // INFO: fetch the users resident data now
  const resident_data = await find_resident_by_user_id(
    validate_user_id.object_id,
  );
  // INFO: check if resident_data exists
  if (!resident_data.length) {
    return res.status(400).json({
      message:
        'The provided user_id does not match to any resident data in the database.',
    });
  }
  // INFO: fetch the document template now
  const document_data = await find_document_by_id(
    validate_document_id.object_id,
  );
  if (!document_data.length) {
    return res.status(400).json({
      message:
        'The provided document_id does not match to any document data in the database.',
    });
  }
  // INFO: now we generate the certificate
  const { file_path, required_data, requires_payment } = document_data[0];
  const _resident_data = resident_data[0];

  // HACK: We need to do this because we explicityly add the or_number prop to the template data later on if the document is paid
  // This is done because the or_number can't be stored in the resident data as it is generated after you complete the payment
  const _required_data = required_data as (keyof ResidentData)[];

  // INFO: prepare the data to insert in the template
  const document_template_data = generate_template_data(
    _resident_data,
    _required_data,
  );
  // INFO: validate if the output data is not an emtpy object
  if (!Object.keys(document_template_data)) {
    return res.status(400).json({
      message:
        'An emtpy object was returned after preparing the data to insert in the template, This is weird call IT team.',
    });
  }
  const template = await download(file_path);
  if (!template) {
    return res.status(400).json({
      message: 'Failed to retrieve the template from the file hosting service.',
    });
  }
  // INFO: handle paid document
  if (requires_payment) {
    if (!req.body.or_number) {
      return res.status(400).json({
        message:
          'The document requested is a paid document, and no or_number is provided.',
      });
    }
    // INFO: append the or_number prop to template data
    document_template_data.or_number = req.body.or_number;
  }
  // INFO: Peform the actual generation, finally...
  const result = await generate_document(
    Buffer.from(template.fileBinary),
    document_template_data,
  );
  if (!result) {
    return res.status(500).json({
      message:
        'The server encountered and error while trying to generate document. Please ensure to provide all the required data for the requested document.',
    });
  }
  return res.status(200).json({
    message: 'Document generated successfully.',
    document: result.toString('base64'),
  });
};

const walk_in_document_generate_controller = async (
  req: Request,
  res: Response,
) => {
  // INFO: Validate the document_id provied
  const { document_id, resident_data, or_number, purpose } = req.body;
  if (!document_id) {
    return res
      .status(400)
      .json({ message: 'Please provide all the required data.' });
  }
  const validated_document_id = validate_object_id(document_id);
  if (!validated_document_id.success) {
    return res.status(400).json({ message: validated_document_id.message });
  }
  // INFO: validate resident_data
  const parsed_resident_data = ResidentSchema.strip().safeParse(resident_data);
  if (!parsed_resident_data.success) {
    return res.status(400).json({
      message: `The resident data provided is not valid.`,
      cause: `${parsed_resident_data.error.issues
        .map((val, _i) => `${val.path.join('|')}: ${val.message}`)
        .join('; ')}.`,
    });
  }
  // INFO: since we are going to perform a hacky auto save we will perform a check on db first to existing resident
  // this however will not be an issue if a feature in which an admin can fetch the info of resident from the db and
  // handle their walk in request
  const { first_name, last_name, date_of_birth } = parsed_resident_data.data;
  const possible_match = await find_resident_by({
    first_name,
    last_name,
    date_of_birth,
  });

  let resident_id: ObjectId = possible_match?.[0]?._id;

  // HACK: save the resident to the resident database and record transaction if no match is found
  if (!possible_match.length) {
    // INFO: validate dob against future date and period of residency
    const { period_of_residency, date_of_birth } = parsed_resident_data.data;
    if (date_of_birth > new Date(Date.now())) {
      return res.status(400).json({
        message: 'The date of birth provided is in the future.',
      });
    }
    const period_of_residency_in_sec = duration_to_seconds(period_of_residency);
    if (period_of_residency_in_sec < 0) {
      return res.status(400).json({
        message: 'Invalid period of residency.',
      });
    }
    const age_in_seconds = get_age_in_seconds(date_of_birth);
    if (age_in_seconds < period_of_residency_in_sec) {
      return res.status(400).json({
        message: 'The period of residency exceeds the age of the resident.',
      });
    }
    const save_resident = await add_new_resident(parsed_resident_data.data);
    if (!save_resident.acknowledged || !save_resident.insertedId) {
      return res.status(500).json({
        message:
          'There was a problem trying to save the resident data to the database. Please try again later or contact the technical team.',
      });
    }
    resident_id = save_resident.insertedId;
  }

  const walkin_transaction_data: WalkInTransaction = {
    status: 'completed',
    document_id: validated_document_id.object_id,
    date: new Date(),
    resident_id: resident_id,
  };

  const record_walkin_transaction = await add_new_walkin_transaction(
    walkin_transaction_data,
  );
  if (
    !record_walkin_transaction.acknowledged ||
    !record_walkin_transaction.insertedId
  ) {
    return res.status(500).json({
      message:
        'There was a problem trying to record the transaction to the database. Please try again later or contact the technical team.',
    });
  }

  // INFO: fetch the document data
  const document_data = await find_document_by_id(
    validated_document_id.object_id,
  );
  if (!document_data.length) {
    return res.status(400).json({
      message:
        'The provided document_id does not match to any document data in the database.',
    });
  }
  // INFO: check if the document is a paid document
  if (document_data[0].requires_payment && !or_number) {
    return res.status(400).json({
      message:
        'The document requested is a paid document but no or_number is provided.',
    });
  }
  // INFO: we generate the template data
  const template_data = generate_template_data(
    parsed_resident_data.data,
    document_data[0].required_data as (keyof ResidentData)[],
  );

  // INFO: validate if the output data is not an emtpy object
  if (!Object.keys(template_data)) {
    return res.status(400).json({
      message:
        'An emtpy object was returned after preparing the data to insert in the template, This is weird call IT team.',
    });
  }
  // INFO: handle paid document
  if (document_data[0].requires_payment) {
    // INFO: append the or_number prop to template data
    template_data.or_number = or_number;
  }
  // INFO: add the purpose if it exists
  if (purpose) {
    template_data.purpose = purpose;
  }
  // INFO: now we fetch the template buffer
  const template_buffer = await download(document_data[0].file_path);
  if (!template_buffer) {
    return res.status(400).json({
      message: 'Failed to retrieve the template from the file hosting service.',
    });
  }
  // INFO: now we generate the document
  const result = await generate_document(
    Buffer.from(template_buffer.fileBinary),
    template_data,
  );
  if (!result) {
    return res.status(500).json({
      message:
        'The server encountered and error while trying to generate document. Please ensure to provide all the required data for the requested document.',
    });
  }
  return res.status(200).json({
    message: 'Document generated successfully.',
    document: result.toString('base64'),
  });
};

const document_delete_controller = async (req: Request, res: Response) => {
  const { document_id } = req.body;
  if (!document_id) {
    return res.status(400).json({ message: 'Missing required parameters.' });
  }
  const validated_document_id = validate_object_id(document_id);
  if (!validated_document_id.success) {
    return res.status(400).json({ message: validated_document_id.message });
  }
  const delete_result = await delete_document_by_id(
    validated_document_id.object_id,
  );
  if (!delete_result.acknowledged || !delete_result.deletedCount) {
    return res.status(500).json({ message: 'Failed to delete document.' });
  }
  return res.status(200).json({ message: 'Document deleted successfully.' });
};

export {
  document_list_controller,
  document_create_controller,
  document_generate_controller,
  walk_in_document_generate_controller,
  document_delete_controller,
};
