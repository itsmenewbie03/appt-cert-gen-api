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

const WalkInTransactionSchema = z.object({
  status: TransactionStatusSchema,
  document_id: z.instanceof(ObjectId),
  date: z.coerce.date(),
  processed_by: z.instanceof(ObjectId).optional(),
  remarks: z.string().optional(),
  resident_id: z.instanceof(ObjectId),
});

type Transaction = z.infer<typeof TransactionSchema>;
type WalkInTransaction = z.infer<typeof WalkInTransactionSchema>;

export {
  Transaction,
  TransactionSchema,
  TransactionStatusSchema,
  WalkInTransaction,
  WalkInTransactionSchema,
};
