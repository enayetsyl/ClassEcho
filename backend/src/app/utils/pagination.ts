// src/app/utils/pagination.ts

import { TPaginationOptions, TPaginationResult } from "../types/utils";



const calculatePagination = (options: TPaginationOptions): TPaginationResult => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, skip, sortBy, sortOrder };
};

export const paginationHelper = { calculatePagination };
