import { Index } from './Index';
import { Entity } from '../decorators/Entity';
import { Cursor } from './Cursor';
import { createObservable } from '../utils/Observable';

export const DIRECTION = {
  ASC: 'next',
  DESC: 'prev',
  ASC_UNIQUE: 'nextunique',
  DESC_UNIQUE: 'prevunique'
};

export class Store<T> {
  private store: IDBObjectStore;

  constructor(store: IDBObjectStore) {
    this.store = store;
  }

  get(key: IDBValidKey | IDBKeyRange) {
    return new Promise<T>((resolve, reject) => {
      const request = this.store.get(key);
      request.addEventListener('success', (e: any) => resolve(e.target.result));
      request.addEventListener('error', reject);
    });
  }

  openCursor(range?: IDBKeyRange | IDBValidKey, direction?: string) {
    let request: IDBRequest = this.store.openCursor.apply(this.store, arguments);



    const result = {
      asCursor: () => createObservable<Cursor<T>>(subscriber => {
        request.addEventListener('success', (e: any) => {
          const cursor: IDBCursorWithValue = e.target.result;

          if (cursor == null) {
            return subscriber.complete();
          }

          subscriber.next(new Cursor<T>(cursor));
        });

        request.addEventListener('error', (e) => subscriber.error(e));
      }),
      asList: async () => {
        const list: Array<T> = [];

        return new Promise<Array<T>>((resolve, reject) => {
          result
            .asCursor()
            .subscribe(cursor => {
              list.push(cursor.value);
              cursor.continue();
            },
            reject,
            () => resolve(list));
        });
      }
    };

    return result;
  }

  add(value: T, key?: IDBKeyRange | IDBValidKey) {
    return new Promise<IDBValidKey>((resolve, reject) => {
      let request: IDBRequest = this.store.add.apply(this.store, arguments);
      request.addEventListener('success', (e: any) => resolve(e.target.result));
      request.addEventListener('error', reject);
    });
  }

  put(value: T, key?: IDBValidKey) {
    return new Promise<IDBValidKey>((resolve, reject) => {
      let request: IDBRequest = this.store.put.apply(this.store, arguments);
      request.addEventListener('success', (e: any) => resolve(e.target.result));
      request.addEventListener('error', reject);
    });
  }

  index(name: keyof T | string) {
    return new Index<T>(this.store.index(name));
  }

  delete(key: IDBKeyRange | IDBValidKey) {
    return new Promise((resolve, reject) => {
      const request = this.store.delete(key);
      request.addEventListener('success', resolve);
      request.addEventListener('error', reject);
    });
  }

  clear() {
    return new Promise((resolve, reject) => {
      const request = this.store.clear();
      request.addEventListener('success', resolve);
      request.addEventListener('error', reject);
    });
  }

  count(key?: IDBKeyRange | IDBValidKey) {
    return new Promise<number>((resolve, reject) => {
      let request: IDBRequest = this.store.count.apply(this.store, arguments);
      request.addEventListener('success', (e: any) => resolve(e.target.result));
      request.addEventListener('error', reject);
    });
  }
}
