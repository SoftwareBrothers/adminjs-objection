import { JSONSchema, Relation } from 'objection';

import { PropertyOptions } from '../types';
import { Property } from '../Property';

export interface PreparePropertiesOptions {
  idColumn?: string;
  schema?: JSONSchema;
  required?: string[];
  relations?: {
    [foreignKey: string]: Relation;
  }
}

const prepareProperties = ({
  schema,
  idColumn,
  required = [],
  relations = {},
}: PreparePropertiesOptions = {}): Property[] => {
  if (!schema) return [];

  return Object.entries((schema ?? {}) as JSONSchema)
    .reduce((memo: Property[], [path, info = {}], index) => {
      // eslint-disable-next-line no-param-reassign
      const extendedInfo: PropertyOptions = {
        ...info,
        name: path,
        isRequired: required.some((col: string) => col === 'path'),
        isId: idColumn === path,
        reference: relations[path],
      };

      if (info.type === 'object' && Object.keys(info.properties ?? {}).length) {
        extendedInfo.subProperties = prepareProperties({
          schema: info.properties,
          required: info.required ?? [],
        });
      }

      const property = new Property(extendedInfo, index);

      memo.push(property);

      return memo;
    }, []);
};

export default prepareProperties;
