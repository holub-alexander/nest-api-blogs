import { SortDirections, SortQueryParams } from '../@types';

export const getObjectToSort = ({ sortBy, sortDirection, field = sortBy }: SortQueryParams) => {
  const sortDirectionValue = sortDirection === SortDirections.ASC ? SortDirections.ASC : SortDirections.DESC;

  if (sortBy) {
    return { [field]: sortDirectionValue };
  }

  return { createdAt: sortDirectionValue };
};
