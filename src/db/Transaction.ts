import { ENTITY_SYMBOL, EntityMetadata } from '../decorators/EntityMetadata';
import { Store } from './Store';
import { Newable } from './Db';

export class Transaction {
  private tx: IDBTransaction;

  private registeredEntities: Array<string>;

  private stores = new Map<any, Store<any>>();

  constructor(db: IDBDatabase, entities: Array<Newable<any>>, mode: 'readonly' | 'readwrite') {
    this.registeredEntities = entities
      .map(entity => new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, entity)))
      .map(x => x.name);

    this.tx = db.transaction(this.registeredEntities, mode);
  }

  for<T>(entity: Newable<T>) {
    if (!this.stores.has(entity)) {
      const metadata = new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, entity));

      if (!this.registeredEntities.some(x => x === metadata.name)) {
        throw `Entity ${metadata.name} not allowed for this transaction!`;
      }

      this.stores.set(entity, new Store(metadata, this.tx.objectStore(metadata.name)));
    }

    return this.stores.get(entity) as Store<T>;
  }

  abort() {
    this.tx.abort();
  }

  completion() {
    return new Promise((resolve, reject) => {
      this.tx.addEventListener('complete', resolve);
      this.tx.addEventListener('error', reject);
      this.tx.addEventListener('abort', () => reject('aborted'));
    });
  }
}
