import { BaseProperty, PropertyType } from 'adminjs';

import { PropertyOptions } from './types.js';

export class Property extends BaseProperty {
  private column: PropertyOptions;

  private columnPosition: number;

  constructor(column: PropertyOptions, columnPosition = 0) {
    const path = column.name;
    super({ path });
    this.column = column;
    this.columnPosition = columnPosition;
  }

  public isEditable(): boolean {
    return !this.isId();
  }

  public isId(): boolean {
    return this.column.isId;
  }

  public name(): string {
    return this.column.name;
  }

  public isRequired(): boolean {
    return this.column.isRequired;
  }

  public isSortable(): boolean {
    return this.type() !== 'reference';
  }

  public reference(): string | null {
    if (!this.column.reference) {
      return null;
    }

    return this.column.reference.relatedModelClass?.tableName;
  }

  public availableValues(): Array<string> | null {
    if (!this.column.enum?.length) return null;

    return this.column.enum.filter(Boolean).map((v) => String(v));
  }

  public position(): number {
    return this.columnPosition || 0;
  }

  public getRawType(): PropertyType {
    let types = this.column.type;
    if (!types) {
      return 'string'; // type is not defined
    }

    if (!Array.isArray(types)) {
      types = [this.column.type as string];
    }

    if (types.includes('object')) return 'mixed';
    if (types.includes('string')) return 'string';
    if (types.includes('boolean')) return 'boolean';
    if (types.includes('integer') || types.includes('number')) return 'number';
    return 'string';
  }

  public type(): PropertyType {
    if (this.column.reference) return 'reference';
    if (this.column.format === 'date-time') return 'datetime';
    if (this.column.format === 'date') return 'date';

    return this.getRawType();
  }

  public isArray(): boolean {
    return Array.isArray(this.column.type) && this.column.type.includes('array');
  }

  public subProperties(): Property[] {
    return this.column.subProperties ?? [];
  }
}
