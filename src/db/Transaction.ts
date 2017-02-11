import { ENTITY_SYMBOL, EntityMetadata } from '../decorators/EntityMetadata';
import { Store } from './Store';
import { Newable } from './Db';

export class Transaction {
  private tx: IDBTransaction;

  private stores = new Map<any, Store<any>>();

  constructor(db: IDBDatabase, entities: Array<Newable<any>>, mode: 'readonly' | 'readwrite') {
    this.tx = db.transaction(
      entities
        .map(entity => new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, entity)))
        .map(x => x.name),
      mode);
  }

  for<T>(entity: Newable<T>) {
    if (!this.stores.has(entity)) {
      this.stores.set(entity, new Store(this.tx.objectStore(new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, entity)).name)));
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
