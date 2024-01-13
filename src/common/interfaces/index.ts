import { PaginationOptionsDto } from '../dto/pagination-options.dto';

export enum SortDirections {
  ASC = 'asc',
  DESC = 'desc',
}

export enum LikeStatuses {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

export enum PairQuizGameStatuses {
  PendingSecondPlayer = 'pending_second_player',
  Active = 'active',
  Finished = 'finished',
}

export enum PairQuizGameAnswerStatuses {
  Correct = 'correct',
  Incorrect = 'incorrect',
}

export interface PageMetaDtoParameters {
  paginationOptionsDto: PaginationOptionsDto;
  totalCount: number;
}

export type Paginator<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;
};

export interface SortQueryParams {
  sortBy: string;
  sortDirection: SortDirections;
  field?: string;
  getField?: (field: string) => string;
}

export interface SortQueryParamsNew {
  sortBy: string;
  sortDirection: SortDirections;
  allowedFieldForSorting: { [key: string]: string };
}
