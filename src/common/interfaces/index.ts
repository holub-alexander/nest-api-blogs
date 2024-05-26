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

export enum ImageSizeVariants {
  Original = 'original',
  Middle = 'middle',
  Small = 'small',
}

export enum PublishedStatuses {
  All = 'all',
  Published = 'published',
  NotPublished = 'not_published',
}

export enum PairQuizProgressStatuses {
  Win = 'win',
  Loss = 'loss',
  Draw = 'draw',
}

export interface PageMetaDtoParameters {
  paginationOptionsDto: Pick<PaginationOptionsDto, 'pageSize' | 'pageNumber'> &
    Partial<Pick<PaginationOptionsDto, 'sortDirection' | 'sortBy'>>;
  totalCount: number;
}

export type Paginator<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;
};

export enum BanStatuses {
  All = 'all',
  Banned = 'banned',
  NotBanned = 'notBanned',
}

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
  defaultField?: string;
}

export interface PairQuizGameUserStatisticQuery {
  user_id: number;
  sum_scores: number | null;
  avg_scores: number | null;
  games_count: number | null;
  wins_count: number | null;
  losses_count: number | null;
  draws_count: number | null;
}

export interface TopUsersQuery {
  user_id: number;
  user_login: string;
  sum_scores: number | null;
  avg_scores: number | null;
  games_count: number | null;
  wins_count: number | null;
  losses_count: number | null;
  draws_count: number | null;
}

export interface PhotoSizeViewModel {
  url: string;
  width: number | null;
  height: number | null;
  fileSize: number | null;
}
