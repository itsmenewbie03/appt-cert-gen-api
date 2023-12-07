import { ResidentSchemaExtended } from "./Resident";
import { z } from "zod";

// INFO: I'm out of ways to I'm doing this xD
const RequiredDataSchema = z.array(ResidentSchemaExtended.keyof());

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
