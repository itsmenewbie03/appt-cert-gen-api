/**
 * Convert a duration string to seconds
 * @param duration - A duration string
 * @returns The equivalent number of seconds or -1 if the duration is invalid
 */
const duration_to_seconds = (duration: string): number => {
  const data = duration.split(/\s+/);
  console.log(`:: data: `, data);

  if (data.length != 2) {
    return -1; // Invalid format
  }

  const [value, unit] = data;
  let numericValue: number;
  try {
    numericValue = parseInt(value);
    if (isNaN(numericValue)) {
      return -1; // Not a number
    }
  } catch (error) {
    return -1; // Invalid value
  }

  const unitMultiplier = {
    days: 1,
    weeks: 7,
    months: 30, // Approximate, actual number of days can vary
    years: 365,
  };

  const lowerUnit = unit.toLowerCase();
  if (!unitMultiplier.hasOwnProperty(lowerUnit)) {
    return -1; // Invalid unit
  }
  // NOTE: we know what we are doing so we gonna tell ts to shutup
  // @ts-ignore
  let days = numericValue * (unitMultiplier[lowerUnit] as number);
  return days * 24 * 60 * 60;
};

const get_age_in_seconds = (date_of_birth: Date) => {
  // Get current timestamp in milliseconds
  const currentTimestamp = Date.now();

  // Convert date of birth to timestamp in milliseconds (assuming YYYY-MM-DD format)
  const dob = new Date(date_of_birth);
  const dobTimestamp = dob.getTime();

  // Calculate age in milliseconds
  const ageInMilliseconds = currentTimestamp - dobTimestamp;

  // Convert age in milliseconds to seconds
  const ageInSeconds = ageInMilliseconds / 1000;

  return ageInSeconds;
};

export { duration_to_seconds, get_age_in_seconds };
