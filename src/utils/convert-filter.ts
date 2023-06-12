import { Filter } from 'adminjs';
import { Model, QueryBuilder, raw } from 'objection';

export const operators = {
  from: '>=',
  to: '<=',
  eq: '=',
  like: 'like',
};

export const convertFilter = (
  qb: QueryBuilder<Model, Model[]>,
  originalFilter: Filter,
): QueryBuilder<Model, Model[]> => {
  if (!originalFilter) return qb;

  const { filters } = originalFilter;

  Object.values(filters).forEach((filter) => {
    const { path, value, property } = filter;

    if (['date', 'datetime'].includes(property.type())) {
      if (typeof value === 'object' && value.from && value.to) {
        qb.where(path, operators.from, value.from);
        qb.where(path, operators.to, value.to);
      } else if (typeof value === 'object' && value.from) {
        qb.where(path, operators.from, value.from);
      } else if (typeof value === 'object' && value.to) {
        qb.where(path, operators.to, value.to);
      }
    } else if (property.type() === 'string' && !!property.availableValues()) {
      qb.where(path, operators.eq, value as string);
    } else if (property.type() === 'string') {
      // Should be safe: https://github.com/knex/documentation/issues/73#issuecomment-572482153
      qb.where(raw(`lower(${path})`), operators.like, `%${String(value).toLowerCase()}%`);
    } else {
      qb.where(path, operators.eq, value as string);
    }
  });

  return qb;
};
