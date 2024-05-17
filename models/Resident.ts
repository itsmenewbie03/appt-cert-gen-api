import z from 'zod';

const GenderSchema = z.union([
  z.literal('male'),
  z.literal('female'),
  z.literal('other'),
  z.literal('prefer not to say'),
]);

const ResidentSchema = z.object({
  first_name: z.string(),
  middle_name: z.optional(z.string()),
  last_name: z.string(),
  name_suffix: z.optional(z.string()),
  address: z.string(),
  gender: GenderSchema,
  date_of_birth: z.coerce.date(),
  period_of_residency: z.string(),
  phone_number: z.string(),
});

// NOTE: this is weird right?
// but this is my codebase, so only my rules apply here xD
const ResidentSchemaExtended = ResidentSchema.extend({
  or_number: z.optional(z.string()),
  purpose: z.optional(z.string()),
});

type ResidentData = z.infer<typeof ResidentSchema>;
type ResidentDataExtended = z.infer<typeof ResidentSchemaExtended>;

export {
  ResidentData,
  ResidentSchema,
  ResidentSchemaExtended,
  ResidentDataExtended,
};
