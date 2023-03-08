import { Resource } from './Resource.js';
import { Database } from './Database.js';

export { Property } from './Property.js';
export { Resource };
export { Database };
export * from './utils/index.js';
export * from './types.js';

const AdminJSObjection = { Resource, Database };

export default AdminJSObjection;
