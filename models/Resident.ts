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
// interface ResidentData {
//     first_name: string;
//     middle_name?: string;
//     last_name: string;
//     name_suffix?: string;
//     gender: Gender;
//     date_of_birth: Date;
//     period_of_residency: string;
//     phone_number: string;
// }
type ResidentData = z.infer<typeof ResidentSchema>;
export { ResidentData, ResidentSchema };
