import { ObjectId } from "mongodb";

interface Admin {
    email: string;
    password: string;
    google_account_id?: string;
    resident_data_id?: ObjectId;
}
export type { Admin };
