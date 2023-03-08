import { knex as Knex } from 'knex';

import knexConfig from '../knexfile.js';
import Office from './office.entity.js';
import Manager from './manager.entity.js';
import { BaseModel } from '../base-model.js';

const knex = BaseModel.knex(Knex(knexConfig[process.env.NODE_ENV ?? 'development']));

export { Office, Manager };
export default knex;
