import { SortDirections, SortQueryParamsNew } from '../interfaces';

export const getObjectToSort = ({ sortBy, sortDirection, allowedFieldForSorting }: SortQueryParamsNew) => {
  const sortDirectionValue = sortDirection === SortDirections.ASC ? SortDirections.ASC : SortDirections.DESC;

  if (allowedFieldForSorting[sortBy]) {
    return { direction: sortDirectionValue.toUpperCase(), field: allowedFieldForSorting[sortBy] };
  } else {
    return { direction: sortDirectionValue.toUpperCase(), field: 'created_at' };
  }
};
