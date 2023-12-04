import { listCommands } from "docx-templates";
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
const validate_document_template = async (
  file: Buffer,
  required_data: string[],
) => {
  const commands = await listCommands(file, ["{", "}"]);
  const commands_code = commands.map((item) => item.code);
  const commands_code_set = [...new Set(commands_code)];
  return is_equal_arrays(commands_code_set, required_data);
};
export { validate_document_template };
