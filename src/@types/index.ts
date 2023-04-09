import { SortDirections } from '@/common/interfaces';

export type PaginationQueryParams = {
  pageNumber: number;
  pageSize: number;
};

export type SortQueryParams = {
  sortBy: string;
  sortDirection: SortDirections;
  field?: string;
  getField?: (field: string) => string;
};

export type PaginationAndSortQueryParams = Partial<PaginationQueryParams & SortQueryParams>;
