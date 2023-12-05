import { ResidentSchema } from "./Resident";
import { z } from "zod";
const RequiredDataSchema = z.array(ResidentSchema.keyof());
const FreeDocumentSchema = z.object({
  type: z.string(),
  file_path: z.string(),
  requires_payment: z.literal(false),
  required_data: RequiredDataSchema,
});

const PaidDocumentSchema = z.object({
  type: z.string(),
  file_path: z.string(),
  requires_payment: z.literal(true),
  required_data: RequiredDataSchema,
  or_number: z.optional(z.string()),
});

const DocumentSchema = z.union([FreeDocumentSchema, PaidDocumentSchema]);
type Document = z.infer<typeof DocumentSchema>;

export { Document, DocumentSchema, RequiredDataSchema };

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
