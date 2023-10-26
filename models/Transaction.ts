import { ObjectId } from "mongodb";
type TransactionStatus =
    | "completed"
    | "pending"
    | "rejected"
    | "paid"
    | "waiting for payment";
interface Transaction {
    status: TransactionStatus;
    document_id: ObjectId;
    user_id: ObjectId;
    date: Date;
    processed_by: ObjectId;
    remarks?: string;
}

export type { Transaction };
