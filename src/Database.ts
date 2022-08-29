import { BaseDatabase, BaseResource, NotImplementedError } from 'adminjs';

export class Database extends BaseDatabase {
  static isAdapterFor(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  resources(): Array<BaseResource> {
    throw new NotImplementedError(`
      To use "@adminjs/objection" you must define "resources" explicitly:
      https://docs.adminjs.co/AdminJSOptions.html#resources
    `);
  }
}
