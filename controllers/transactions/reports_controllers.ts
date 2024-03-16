import type { Request, Response } from "express";
import { get_all_transaction } from "../../services/transaction_services";
import { DocumentData, ReportData } from "../../models/ReportData";
import { DateRangeSchema } from "../../models/DateRange";
import { find_document_by_id } from "../../services/document_services";
import { ObjectId } from "mongodb";
import { find_admin_by } from "../../services/admin_services";
import { find_employee_by } from "../../services/employee_services";
import { find_resident_by_id } from "../../services/resident_services";
import { generate_report } from "../../utils/report_generator";

const generate_report_controller = async (req: Request, res: Response) => {
  const DateRangeValidator = DateRangeSchema.strip();
  const validated_date_range = DateRangeValidator.safeParse(req.body);
  if (!validated_date_range.success) {
    return res.status(400).json({
      message: `The date range provided is not valid.`,
      cause: `${validated_date_range.error.issues
        .map((val, i) => `${val.path.join("|")}: ${val.message}`)
        .join("; ")}.`,
    });
  }
  const { start_date, end_date } = validated_date_range.data;
  // TODO: pull the transactions from the database
  const transactions = await get_all_transaction();
  const filtered_transactions = transactions.filter(
    (x) => x.date >= start_date && x.date <= end_date,
  );

  const document_request_data: { [key: string]: number } = {};
  // WARN: dumb implementation ahead, r.i.p peroformance
  for (const transaction of filtered_transactions) {
    const key = transaction.document_id.toString();
    const is_new = !Object.keys(document_request_data).includes(key);
    if (is_new) {
      document_request_data[key] = 1;
      continue;
    }
    document_request_data[key] += 1;
  }

  // WARN: this code is trash NGL, but it should work
  // bye blazingly fast performance xD
  const docs: DocumentData[] = await Promise.all(
    Object.keys(document_request_data).map(async (key) => {
      let name: string = "Unknown";
      const document_data = await find_document_by_id(new ObjectId(key));
      if (document_data) {
        name = document_data[0].type;
      }
      return {
        name,
        count: document_request_data[key],
      };
    }),
  );
  console.log(docs);

  // TODO: build the report data
  const current_date = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const role = req.headers["role"] as string;
  const email = req.headers["email"] as string;
  const find_by = role === "admin" ? find_admin_by : find_employee_by;
  let name: string | null = null;
  // NOTE: this is almost guaranteed to never fail
  // but we have trust issues
  const user = await find_by({ email });
  const resident_data_id = user[0].resident_data_id as ObjectId;
  const resident_data = await find_resident_by_id(resident_data_id);
  if (resident_data.length) {
    name = `${resident_data[0].first_name} ${resident_data[0].last_name}`;
  }
  const report_data: ReportData = {
    start_date,
    end_date,
    total: filtered_transactions.length,
    docs,
    generated_at: current_date,
    generated_by: name ?? email,
  };
  const report_docx = await generate_report(report_data);
  if (!report_docx) {
    return res.status(500).json({
      message: "An error occured while generating the report.",
    });
  }
  return res.status(200).json({
    message: "Report generated successfully.",
    document: report_docx.toString("base64"),
  });
};

export { generate_report_controller };
