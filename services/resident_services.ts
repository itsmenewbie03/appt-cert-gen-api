import type { ResidentData } from "../models/Resident";
import { database } from "../db/mongo";

const add_new_resident = async (resident_data: ResidentData) => {
    /**
     * TODO:
     * ADD STRICT UNIQUE NAME IF REQUIRED
     */
    return await database.collection("residents").insertOne(resident_data);
};

export { add_new_resident };
