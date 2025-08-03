export type TMeta = {
  limit: number;
  page: number;
  total: number;
  totalPage: number;
};

export type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  meta?: TMeta;
  data?: T;
};


export type  SendMailOptions = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string; 
}

// src/app/types/pagination.ts

export type TPaginationOptions = {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type TPaginationResult = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
};
