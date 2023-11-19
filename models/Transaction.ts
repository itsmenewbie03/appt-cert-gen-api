import { ObjectId } from "mongodb";
import { z } from "zod";
const TransactionStatusSchema = z.enum([
  "completed",
  "pending",
  "rejected",
  "waiting for payment",
]);

const TransactionSchema = z.object({
  status: TransactionStatusSchema,
  document_id: z.instanceof(ObjectId),
  user_id: z.instanceof(ObjectId),
  date: z.coerce.date(),
  processed_by: z.instanceof(ObjectId).optional(),
  remarks: z.string().optional(),
});

type Transaction = z.infer<typeof TransactionSchema>;
export { Transaction, TransactionSchema, TransactionStatusSchema };
// type TransactionStatus =
//   | "completed"
//   | "pending"
//   | "rejected"
//   | "waiting for payment";
// interface Transaction {
//   status: TransactionStatus;
//   document_id: ObjectId;
//   user_id: ObjectId;
//   date: Date;
//   processed_by: ObjectId;
//   remarks?: string;
// }
//
// export type { Transaction };
