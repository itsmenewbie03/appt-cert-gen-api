import { ObjectId } from "mongodb";

interface User {
    email: string;
    password: string;
    google_account_id?: string;
    resident_data_id: ObjectId;
}
export type { User };
