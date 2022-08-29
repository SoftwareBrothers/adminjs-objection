import { flat, ParamsType, paramConverter } from 'adminjs';

import { Property } from '../Property';

const prepareParams = (params: ParamsType, properties: Property[]): Record<string, unknown> => {
  const newParams = { ...params };

  properties.forEach((property) => {
    const path = property.path();
    const value = flat.get(newParams, path);

    if (value) {
    /*
      Objection doesn't convert types automatically.
      AdminJS does, but type: "reference" is not a convertable type so it must be done here
      before saving the record.
    */
      if (property.type() === 'reference') {
        const convertedValue = paramConverter.convertParam(value, property.getRawType());

        newParams[path] = convertedValue;
      }

      if (property.type() === 'datetime' || property.type() === 'date') {
        const convertedValue = typeof value !== 'string' && value?.constructor?.name === 'Date'
          ? value.toISOString()
          : String(value);

        newParams[path] = convertedValue;
      }
    }
  });

  return flat.unflatten(newParams);
};

export default prepareParams;
