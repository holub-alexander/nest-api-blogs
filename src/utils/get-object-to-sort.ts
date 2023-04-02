import { SortDirections, SortQueryParams } from '../@types';

export const getObjectToSort = ({ sortBy, sortDirection }: SortQueryParams) => {
  const sortDirectionValue = sortDirection === SortDirections.ASC ? SortDirections.ASC : SortDirections.DESC;

  if (sortBy) {
    return { [sortBy]: sortDirectionValue };
  }

  return { createdAt: sortDirectionValue };
};
