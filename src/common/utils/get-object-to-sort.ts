import { SortDirections, SortQueryParams } from '@/common/interfaces';

export const getObjectToSort = ({ sortBy, sortDirection, field = sortBy, getField }: SortQueryParams) => {
  const sortDirectionValue = sortDirection === SortDirections.ASC ? SortDirections.ASC : SortDirections.DESC;

  if (sortBy) {
    return { [field]: sortDirectionValue };
  }

  if (getField) {
    return { [getField('createdAt')]: sortDirectionValue };
  }

  return { createdAt: sortDirectionValue };
};
