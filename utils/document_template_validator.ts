import { listCommands } from 'docx-templates';
const is_equal_arrays = (arr1: string[], arr2: string[]) => {
  if (arr1.length !== arr2.length) {
    return false;
  }
  const sortedArr1 = arr1.slice().sort();
  const sortedArr2 = arr2.slice().sort();
  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return false;
    }
  }
  return true;
};

interface ValidateDocumentTemplate {
  success: boolean;
  message: string;
}
const validate_document_template = async (
  file: Buffer,
  required_data: string[],
  is_paid: boolean = false,
): Promise<ValidateDocumentTemplate> => {
  const commands = await listCommands(file, ['{', '}']);
  if (!commands.length) {
    return {
      success: false,
      message: 'The template does not contain any placeholders.',
    };
  }
  const commands_code = commands.map((item) => item.code);
  const commands_code_set = [...new Set(commands_code)];
  // PERF: explicitly check for or_number on the template if the document is paid
  if (is_paid && !commands_code_set.includes('or_number')) {
    return {
      success: false,
      message: 'The field or_number is required for a paid document.',
    };
  }
  const matched = is_equal_arrays(commands_code_set, required_data);
  if (!matched) {
    return {
      success: false,
      message: 'The template does not match the required data',
    };
  }
  return { success: true, message: 'The template is valid' };
};
export { validate_document_template };
