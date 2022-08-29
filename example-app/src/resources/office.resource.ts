import { Office } from '../models';

const OfficeResource = {
  resource: Office,
  options: {
    properties: {
      createdAt: { isVisible: { edit: false, list: true, show: true, filter: true } },
      updatedAt: { isVisible: { edit: false, list: true, show: true, filter: true } },
    },
  },
};

export default OfficeResource;
