import { createReport } from 'docx-templates';
import { ReportData } from '../models/ReportData';
import { download } from './file_host';
const date_hack = (date: Date) => date.toISOString().split('T')[0];
const generate_report = async (data: ReportData) => {
  const template_data = await download('/TEMPLATES/REPORT_TEMPLATE.docx');
  if (!template_data) {
    return;
  }
  // TODO: hack the dates by telling to shut-up
  // @ts-ignore
  data.start_date = date_hack(data.start_date);
  // @ts-ignore
  data.end_date = date_hack(data.end_date);
  const report = await createReport({
    template: Buffer.from(template_data.fileBinary),
    data,
    cmdDelimiter: ['{', '}'],
  });
  return Buffer.from(report);
};

export { generate_report };
