import { ResidentSchema } from "./Resident";
import { z } from "zod";
const FreeDocumentSchema = z.object({
  type: z.string(),
  requires_payment: z.literal(false),
  required_data: z.array(ResidentSchema.keyof()),
});

const PaidDocumentSchema = z.object({
  type: z.string(),
  requires_payment: z.literal(true),
  required_data: z.array(ResidentSchema.keyof()),
  or_number: z.string(),
});

const DocumentSchema = z.union([FreeDocumentSchema, PaidDocumentSchema]);
type Document = z.infer<typeof DocumentSchema>;
export { Document, DocumentSchema };
// NOTE: just gonna leave this here xD
// interface FreeDocument {
//   type: string;
//   requires_payment: false;
//   required_data: (keyof Partial<ResidentData>)[];
// }
// interface PaidDocument {
//   type: string;
//   requires_payment: true;
//   required_data: (keyof Partial<ResidentData>)[];
//   or_number: string;
// }
// type Document = FreeDocument | PaidDocument;
// export type { Document };
