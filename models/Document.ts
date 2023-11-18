import { ResidentData } from "./Resident";
interface FreeDocument {
  type: string;
  requires_payment: false;
  required_data: (keyof Partial<ResidentData>)[];
}
interface PaidDocument {
  type: string;
  requires_payment: true;
  required_data: (keyof Partial<ResidentData>)[];
  or_number: string;
}
type Document = FreeDocument | PaidDocument;
export type { Document };
