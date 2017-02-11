import { EntityMetadata, ENTITY_SYMBOL } from './EntityMetadata';

export function Index(): PropertyDecorator;
export function Index(options: IDBIndexParameters): PropertyDecorator;
export function Index(key: string): PropertyDecorator;
export function Index(key: string, options: IDBIndexParameters): PropertyDecorator;
export function Index(arg1?: any, arg2?: any): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    let name = propertyKey.toString();
    let options: IDBIndexParameters = arg2 || {};

    if (typeof arg1 === 'string') {
      name = arg1;
    } else {
      options = arg1 || {};
    }

    const entityMetadata = new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, target.constructor));

    const index = entityMetadata.indices.find(x => x.name === name);
    if (index != null) {
      index.keyPath.push(propertyKey.toString());
    } else {
      entityMetadata.indices.push({ name, keyPath: [propertyKey.toString()], options });
    }

    Reflect.defineMetadata(ENTITY_SYMBOL, entityMetadata, target.constructor);
  };
};

// export function NestedIndex(parent: Object, name: string, options: IDBIndexParameters = {}): PropertyDecorator {
//   return (target: Object, propertyKey: string | symbol) => {
//     const entityMetadata = new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, parent.constructor));
//     const index = entityMetadata.indices.find(x => x.name === `${name}.${propertyKey.toString()}`);
//     if (index != null) {
//       index.keyPath.push(`${name}.${propertyKey.toString()}`);
//     } else {
//       entityMetadata.indices.push({ name: `${name}.${propertyKey.toString()}`, keyPath: [`${name}.${propertyKey.toString()}`], options });
//     }
//   };
// }
