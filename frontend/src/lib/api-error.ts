import type { IGenericErrorResponse } from "@/types/error.types";
import { AxiosError } from "axios";

/**
 * Extract a user-friendly message from API or unknown errors.
 */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as IGenericErrorResponse | undefined;
    const msg = data?.message;
    if (typeof msg === "string" && msg.length > 0) return msg;
    const first = data?.errorSources?.[0]?.message;
    if (typeof first === "string") return first;
    if (error.response?.status === 404) return "Resource not found.";
    if (error.response?.status && error.response.status >= 500)
      return "Server error. Please try again.";
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
