/**
 * MongoDB ObjectId is 24 hex characters.
 */
export function isValidMongoId(id: string | undefined): boolean {
  if (!id || typeof id !== "string") return false;
  return /^[a-f0-9]{24}$/i.test(id);
}

/**
 * Validate date range: start and end are valid dates and start <= end.
 */
export function isValidDateRange(
  startDate: string,
  endDate: string,
): { valid: boolean; message?: string } {
  if (!startDate || !endDate) return { valid: true };
  const start = Date.parse(startDate);
  const end = Date.parse(endDate);
  if (Number.isNaN(start))
    return { valid: false, message: "Invalid start date" };
  if (Number.isNaN(end)) return { valid: false, message: "Invalid end date" };
  if (start > end)
    return {
      valid: false,
      message: "Start date must be before or equal to end date",
    };
  return { valid: true };
}
