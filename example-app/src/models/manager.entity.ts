import { BaseModel } from '../base-model';

import Office from './office.entity';

class Manager extends BaseModel {
  id: number;

  firstName: string;

  lastName: string;

  age: number;

  officeId?: number;

  office?: Office;

  static tableName = 'managers';

  static jsonSchema = {
    type: 'object',
    required: ['firstName', 'lastName'],

    properties: {
      id: { type: 'integer' },
      officeId: { type: 'integer' },
      firstName: { type: 'string', minLength: 1, maxLength: 255 },
      lastName: { type: 'string', minLength: 1, maxLength: 255 },
      age: { type: 'number' },
      createdAt: { type: 'string', format: 'date-time', readOnly: true },
      updatedAt: { type: 'string', format: 'date-time', readOnly: true },
    },
  };

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static relationMappings = () => ({
    office: {
      relation: BaseModel.BelongsToOneRelation,
      // The related model. This can be either a Model subclass constructor or an
      // absolute file path to a module that exports one.
      modelClass: Office,
      join: {
        from: 'managers.officeId',
        to: 'offices.id',
      },
    },
  });
}

export default Manager;
