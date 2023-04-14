import { PageMetaDtoParameters } from '../interfaces';

export class PaginationMetaDto {
  public readonly pagesCount: number;

  public readonly page: number;

  public readonly pageSize: number;

  public readonly totalCount: number;

  constructor({ paginationOptionsDto, totalCount }: PageMetaDtoParameters) {
    this.pagesCount = Math.ceil(totalCount / paginationOptionsDto.pageSize);
    this.page = +paginationOptionsDto.pageNumber;
    this.pageSize = +paginationOptionsDto.pageSize;
    this.totalCount = totalCount;
  }
}
