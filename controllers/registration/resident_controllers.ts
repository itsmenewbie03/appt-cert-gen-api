import type { Request, Response } from 'express';
import { ResidentSchema } from '../../models/Resident';
import {
  add_new_resident,
  find_resident_by,
} from '../../services/resident_services';
import {
  get_age_in_seconds,
  duration_to_seconds,
} from '../../utils/date_utils';

const resident_register_controller = async (req: Request, res: Response) => {
  const { info } = req.body;

  if (!info) {
    return res
      .status(400)
      .json({ message: 'Invalid request, please use your brain.' });
  }

  const resident_validator = ResidentSchema.strip();
  const resident_data_parsed = resident_validator.safeParse(info);

  if (!resident_data_parsed.success) {
    return res.status(400).json({
      message: `The resident data provided is not valid.`,
      cause: `${resident_data_parsed.error.issues
        .map((val, i) => `${val.path.join('|')}: ${val.message}`)
        .join('; ')}.`,
    });
  }
  const { first_name, last_name, date_of_birth, period_of_residency } =
    resident_data_parsed.data;

  // INFO: check if the date of birth is in the future
  if (date_of_birth > new Date(Date.now())) {
    return res.status(400).json({
      message: 'The date of birth provided is in the future.',
    });
  }

  // INFO: check if the period of residency is valid relative to the date of birth
  const period_of_residency_in_sec = duration_to_seconds(period_of_residency);
  console.log(`:: period_of_residency_in_sec: `, period_of_residency_in_sec);
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

  const possible_match = await find_resident_by({
    first_name,
    last_name,
    date_of_birth,
  });

  if (possible_match.length) {
    return res.status(400).json({ message: 'Resident already exists.' });
  }

  const add_new_resident_result = await add_new_resident(
    resident_data_parsed.data,
  );

  if (
    !add_new_resident_result.acknowledged ||
    !add_new_resident_result.insertedId
  ) {
    return res.status(500).json({
      message: "Failed to insert resident's info to the database",
    });
  }

  return res.status(200).json({ message: 'Resident registered successfully.' });
};

export { resident_register_controller };
