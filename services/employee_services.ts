import { database } from "../db/mongo";
import type { Admin } from "../models/Admin";
import type { Collection } from "mongodb";

const find_employee_by = async (employee_query: Partial<Admin>) => {
    const employees: Collection<Admin> = database.collection("employees");
    const employee_data = await employees
        .find({ ...employee_query }, { projection: { _id: 0 } })
        .toArray();
    return employee_data;
};
const add_new_employee = async (employee_data: Admin) => {
    const employees: Collection<Admin> = database.collection("employees");
    return await employees.insertOne(employee_data);
};
export { find_employee_by, add_new_employee };
