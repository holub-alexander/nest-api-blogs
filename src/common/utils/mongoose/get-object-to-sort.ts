import { SortDirections, SortQueryParams } from '../../interfaces';

export const getObjectToSort = ({ sortBy, sortDirection, field = sortBy, getField }: SortQueryParams) => {
  const sortDirectionValue = sortDirection === SortDirections.ASC ? SortDirections.ASC : SortDirections.DESC;

  if (sortBy) {
    return { [field]: sortDirectionValue };
  }

  if (getField) {
    return { [getField('created_at')]: sortDirectionValue };
  }

  return { createdAt: sortDirectionValue };
};
