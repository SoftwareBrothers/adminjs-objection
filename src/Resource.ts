/* eslint-disable class-methods-use-this */
import {
  BaseResource,
  Filter,
  BaseRecord,
  ParamsType,
  BaseProperty,
  SupportedDatabasesType,
  ValidationError,
} from 'adminjs';
import { Model, QueryBuilder } from 'objection';

import { FindOptions, SortOptions, ForeignKeyToRelationMapping } from './types.js';
import { prepareParams, prepareProperties, convertFilter } from './utils/index.js';
import { Property } from './Property.js';

export class Resource extends BaseResource {
  private model: typeof Model;

  private relations: ForeignKeyToRelationMapping;

  static isAdapterFor(resource: typeof Model): boolean {
    return !!resource.jsonSchema && !!resource.tableName;
  }

  constructor(resource: typeof Model) {
    super(resource);

    this.model = resource;
    this.relations = this.getRelations();
  }

  databaseName(): string {
    return this.model.knex?.()?.client?.config?.connection?.database ?? 'Objection';
  }

  databaseType(): SupportedDatabasesType | string {
    return this.model.knex?.()?.client?.config?.client ?? 'Other';
  }

  id(): string {
    return this.model.tableName;
  }

  properties(): Array<Property> {
    // AdminJS requires 1 primary key
    const idColumn = Array.isArray(this.model.idColumn)
      ? this.model.idColumn[0]
      : this.model.idColumn;

    const properties = prepareProperties({
      schema: this.model.jsonSchema.properties,
      idColumn,
      required: this.model.jsonSchema.required,
      relations: this.relations,
    });

    return properties;
  }

  property(path: string): BaseProperty | null {
    return this.properties().find((p) => p.path() === path) ?? null;
  }

  async count(filter: Filter): Promise<number> {
    const qb = this.getQueryBuilder();
    convertFilter(qb, filter);

    const result = await qb.count({ count: '*' }).first() as any;

    return result?.count ? Number(result.count) : 0;
  }

  async find(
    filter: Filter,
    options: FindOptions,
  ): Promise<Array<BaseRecord>> {
    const qb = this.getQueryBuilder(options);
    convertFilter(qb, filter);

    const results = await qb;
    if (!results?.length) return [];

    return results.map((r) => new BaseRecord(r, this));
  }

  async findOne(id: string): Promise<BaseRecord | null> {
    const qb = this.getQueryBuilder();

    const result = await qb.findById(id);

    if (!result) return null;

    return new BaseRecord(result, this);
  }

  async findMany(ids: Array<string | number>): Promise<Array<BaseRecord>> {
    const qb = this.getQueryBuilder();

    const results = await qb.findByIds(ids);
    if (!results?.length) return [];

    return results.map((r) => new BaseRecord(r, this));
  }

  async create(params: ParamsType): Promise<ParamsType> {
    try {
      const qb = this.getQueryBuilder();

      const result = await qb.insert(prepareParams(params, this.properties()));

      return result;
    } catch (error) {
      this.handleValidationError(error);

      return params;
    }
  }

  async update(id: string, params: ParamsType): Promise<ParamsType> {
    try {
      const qb = this.getQueryBuilder();

      const result = await qb
        .patchAndFetchById(id, prepareParams(params, this.properties()));

      return result;
    } catch (error) {
      this.handleValidationError(error);

      return params;
    }
  }

  async delete(id: string): Promise<void> {
    const qb = this.getQueryBuilder();

    await qb.deleteById(id);
  }

  private getRelations(): ForeignKeyToRelationMapping {
    const relations = this.model.getRelations();

    return Object.values(relations).reduce((memo, current) => {
      if (!current.constructor?.name || current.constructor.name !== 'BelongsToOneRelation') {
        return memo;
      }

      const foreignKey = current?.ownerProp?.cols?.[0];
      if (!foreignKey) {
        return memo;
      }

      memo[foreignKey] = current;

      return memo;
    }, {});
  }

  private withPagination(
    queryBuilder: QueryBuilder<Model, Model[]>,
    { limit, offset }: Pick<FindOptions, 'limit' | 'offset'>,
  ) {
    if (limit !== null && limit && limit > 0) queryBuilder.limit(limit);
    if (offset !== null && offset && offset > 0) queryBuilder.offset(offset);

    return queryBuilder;
  }

  private withSort(
    queryBuilder: QueryBuilder<Model, Model[]>,
    { sortBy, direction }: SortOptions,
  ) {
    if (!sortBy) return queryBuilder;

    return queryBuilder.orderBy(sortBy, direction ?? 'asc');
  }

  private getQueryBuilder({ limit = null, offset = null, sort = {} }: FindOptions = {}): QueryBuilder<Model, Model[]> {
    const { sortBy, direction } = sort;

    const qb = this.model.query();

    this.withPagination(qb, { limit, offset });
    this.withSort(qb, { sortBy, direction });

    return qb;
  }

  private handleValidationError(error) {
    const { type, data } = error;

    if (type !== 'ModelValidation') throw error;

    const errors = Object.entries<Record<string, any>[]>(data ?? {})
      .reduce((memo, [column, info]) => {
        if (!info) return memo;
        if (Array.isArray(info)) {
          memo[column] = {
            message: info?.map(({ message }) => message).join('\\n'),
          };
        } else {
          memo[column] = { message: info };
        }

        return memo;
      }, {});

    throw new ValidationError(errors);
  }
}
