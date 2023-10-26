type Gender = "male" | "female" | "other" | "prefer not to say";
interface ResidentData {
    first_name: string;
    middle_name?: string;
    last_name: string;
    name_suffix?: string;
    gender: Gender;
    date_of_birth: Date;
    period_of_residency: string;
    phone_number: string;
}
export type { ResidentData };
