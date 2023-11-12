import { ObjectId } from "mongodb";
import z from "zod";

const AdminSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  google_account_id: z.optional(z.string()),
  resident_data_id: z.optional(z.instanceof(ObjectId)),
});

// interface Admin {
//     email: string;
//     password: string;
//     google_account_id?: string;
//     resident_data_id?: ObjectId;
// }
type Admin = z.infer<typeof AdminSchema>;

export { Admin, AdminSchema };
