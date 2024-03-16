import { z } from "zod";

const DateRangeSchema = z.object({
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
});

type DateRange = z.infer<typeof DateRangeSchema>;
export { DateRange, DateRangeSchema };
