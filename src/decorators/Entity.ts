import { EntityMetadata, ENTITY_SYMBOL } from './EntityMetadata';

export const Entity = (): ClassDecorator => {
  return (target: Function) => {
    const entityMetadata = new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, target));
    entityMetadata.name = target.name;
    Reflect.defineMetadata(ENTITY_SYMBOL, entityMetadata, target);
  };
};
