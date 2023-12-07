import z from "zod";
const GenderSchema = z.union([
  z.literal("male"),
  z.literal("female"),
  z.literal("other"),
  z.literal("prefer not to say"),
]);

const ResidentSchema = z.object({
  first_name: z.string(),
  middle_name: z.optional(z.string()),
  last_name: z.string(),
  name_suffix: z.optional(z.string()),
  gender: GenderSchema,
  date_of_birth: z.coerce.date(),
  period_of_residency: z.string(),
  phone_number: z.string(),
});
const ResidentSchemaExtended = ResidentSchema.extend({
  or_number: z.optional(z.string()),
});

type ResidentData = z.infer<typeof ResidentSchema>;
type ResidentDataExtended = z.infer<typeof ResidentSchemaExtended>;
export {
  ResidentData,
  ResidentSchema,
  ResidentSchemaExtended,
  ResidentDataExtended,
};
