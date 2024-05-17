import { z } from 'zod';

const RoleSchema = z.union([
  z.literal('admin'),
  z.literal('employee'),
  z.literal('user'),
]);

interface RefreshTokenData {
  email: string;
  role: Role;
}

type Role = z.infer<typeof RoleSchema>;

export { RefreshTokenData, Role, RoleSchema };
