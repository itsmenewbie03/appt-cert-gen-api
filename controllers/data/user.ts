import type { Request, Response } from 'express';
import { validate_object_id } from '../../utils/object_id_validator';
import { find_user_by, find_user_by_id } from '../../services/user_services';
import { find_resident_by_id } from '../../services/resident_services';

const user_find_controller = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ message: 'The user_id is required.' });
  }
  const validated_user_id = validate_object_id(user_id);
  if (!validated_user_id.success) {
    return res.status(400).json({ message: validated_user_id.message });
  }
  const user = await find_user_by_id(validated_user_id.object_id);
  if (!user.length) {
    return res.status(404).json({
      message: 'No user with the provided id exists in the database.',
    });
  }

  const { resident_data_id } = user[0];

  // INFO: this is another weird case xD
  if (!resident_data_id) {
    return res.status(500).json({
      message:
        'This is a weird case, the user does not have a resident_data_id property. Call the IT guy.',
    });
  }

  // INFO: this is another weird case xD
  const resident_data = await find_resident_by_id(resident_data_id);
  if (!resident_data.length) {
    return res.status(500).json({
      message:
        'This is a weird case, the user has the resident_data_id property but it does not have a match in the database. Call the IT guy.',
    });
  }
  return res
    .status(200)
    .json({ message: 'User found successfully', data: resident_data[0] });
};

export { user_find_controller };
