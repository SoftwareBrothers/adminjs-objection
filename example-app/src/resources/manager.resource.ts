import { Manager } from '../models';

const ManagerResource = {
  resource: Manager,
  options: {
    properties: {
      createdAt: { isVisible: { edit: false, list: true, show: true, filter: true } },
      updatedAt: { isVisible: { edit: false, list: true, show: true, filter: true } },
    },
  },
};

export default ManagerResource;
