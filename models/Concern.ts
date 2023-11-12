import { ObjectId } from "mongodb";
type ConcernStatus =
  | "Open"
  | "In Progress"
  | "Closed"
  | "Resolved"
  | "Reopened";

// Usage example

interface Concern {
  message: string;
  transaction_id?: ObjectId;
  date: Date;
  user_id: ObjectId;
  status: ConcernStatus;
}
export type { Concern };
