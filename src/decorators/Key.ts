import { EntityMetadata, ENTITY_SYMBOL } from './EntityMetadata';

export interface KeyOptions {
  autoIncrement: boolean;
}

const getDefaultOptions = (): KeyOptions => ({
  autoIncrement: false
});

export const Key = (options: KeyOptions = getDefaultOptions()): PropertyDecorator => {
  return (target: Object, propertyKey: string | symbol) => {
    const entityMetadata = new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, target.constructor));
    entityMetadata.autoIncrement = options.autoIncrement;
    entityMetadata.keyPath.push(propertyKey.toString());
    Reflect.defineMetadata(ENTITY_SYMBOL, entityMetadata, target.constructor);
  };
};
