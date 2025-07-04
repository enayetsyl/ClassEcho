// frontend/src/types/error.types.ts
export interface IGenericErrorResponse {
  message: string;
  errorSources: { path: string | number; message: string }[];
}
