export const ENTITY_SYMBOL = Symbol('Entity');

export interface Index {
  name: string;

  keyPath: Array<string>;

  options: IDBIndexParameters;
}

export class EntityMetadata {
  name: string;

  indices: Array<Index>;

  autoIncrement: boolean;

  keyPath: Array<string>;

  constructor(o: any = {}) {
    this.name = o.name;
    this.autoIncrement = o.autoIncrement || false;
    this.indices = o.indices || [];
    this.keyPath = o.keyPath || [];
  }
}
