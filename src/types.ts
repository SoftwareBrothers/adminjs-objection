import { JSONSchema, Relation } from 'objection';

import { Property } from './Property.js';

export interface SortOptions {
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

export interface FindOptions {
  limit?: number | null;
  offset?: number | null;
  sort?: SortOptions;
}

export interface PropertyOptions extends JSONSchema {
  isId: boolean;
  isRequired: boolean;
  name: string;
  subProperties: Property[];
  reference?: Relation;
}

export interface ForeignKeyToRelationMapping {
  [foreignKey: string]: Relation;
}
