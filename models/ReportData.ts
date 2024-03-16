import z from "zod";
const DocumentDataSchema = z.object({
  name: z.string(),
  count: z.number(),
});

const ReportDataSchema = z.object({
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  docs: z.array(DocumentDataSchema),
  total: z.number(),
  generated_at: z.string(),
  generated_by: z.string(),
});

type ReportData = z.infer<typeof ReportDataSchema>;
type DocumentData = z.infer<typeof DocumentDataSchema>;

export type { ReportData, DocumentData };
