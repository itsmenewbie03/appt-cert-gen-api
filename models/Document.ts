interface GenericDocument {
    first_name: string;
    middle_name?: string;
    last_name: string;
    or_number: string;
    date_issued: Date;
    title: String;
}
interface BarangayCertificate extends GenericDocument {
    period_of_residency: string;
}
type Document = GenericDocument | BarangayCertificate;
export type { Document };
