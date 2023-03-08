import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';

import * as AdminJSObjection from '../../src/index.js';
import { ManagerResource, OfficeResource } from './resources/index.js';

AdminJS.registerAdapter(AdminJSObjection);

const start = async () => {
  const app = express();

  const admin = new AdminJS({
    resources: [
      OfficeResource,
      ManagerResource,
    ],
  });

  const router = AdminJSExpress.buildRouter(admin);

  app.use(admin.options.rootPath, router);

  app.listen(3001, () => {
    // eslint-disable-next-line no-console
    console.log('app started');
  });
};

start();
