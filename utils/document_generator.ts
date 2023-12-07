import { createReport } from "docx-templates";
import { ResidentData } from "../models/Resident";
/**
 * This functions throws an error when the data provided does not fulfill all the fields in the template, but extra datas are fine.
 **/
const generate_document = async (
  template: Buffer,
  data: Partial<ResidentData> & { or_number?: string },
) => {
  try {
    const result = await createReport({
      template,
      data: data,
      cmdDelimiter: ["{", "}"],
    });
    return Buffer.from(result);
  } catch (err: any) {
    console.log(`generate_document throwed dizz: ${err}`);
    return null;
  }
};
// HACK: this code is *holy fucking shit*
const generate_template_data = (
  data: ResidentData,
  required_data: (keyof ResidentData)[],
) => {
  return required_data.reduce(
    (result: { [key: string]: any }, prop: keyof ResidentData) => {
      if (data.hasOwnProperty(prop)) {
        result[prop] = data[prop];
      }
      return result;
    },
    {},
  );
};

export { generate_document, generate_template_data };
