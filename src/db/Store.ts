import { Index } from './Index';
import { Entity } from '../decorators/Entity';
import { Cursor } from './Cursor';
import { createObservable, Observable } from '../utils/Observable';
import { createCursorResult } from '../utils/CursorResult';
import { EntityMetadata } from '../decorators/EntityMetadata';

export const DIRECTION = {
  ASC: 'next',
  DESC: 'prev',
  ASC_UNIQUE: 'nextunique',
  DESC_UNIQUE: 'prevunique'
};

export class Store<T> {
  private meta: EntityMetadata;

  private store: IDBObjectStore;

  constructor(metadata: EntityMetadata, store: IDBObjectStore) {
    this.meta = metadata;
    this.store = store;
  }

  get(key: IDBValidKey | IDBKeyRange) {
    const request = this.store.get(key);

    return new Promise<T>((resolve, reject) => {
      request.addEventListener('success', (e: any) => resolve(e.target.result));
      request.addEventListener('error', reject);
    });
  }

  openCursor(range?: IDBKeyRange | IDBValidKey, direction?: string) {
    let request: IDBRequest = this.store.openCursor.apply(this.store, arguments);

    return createCursorResult<T>(request);
  }

  add(value: T, key?: IDBKeyRange | IDBValidKey) {
    let request: IDBRequest = this.store.add.apply(this.store, arguments);

    return new Promise<IDBValidKey>((resolve, reject) => {
      request.addEventListener('success', (e: any) => resolve(e.target.result));
      request.addEventListener('error', reject);
    });
  }

  put(value: T, key?: IDBValidKey) {
    let request: IDBRequest = this.store.put.apply(this.store, arguments);

    return new Promise<IDBValidKey>((resolve, reject) => {
      request.addEventListener('success', (e: any) => resolve(e.target.result));
      request.addEventListener('error', reject);
    });
  }

  index(name: keyof T | string) {
    if (!this.meta.indices.some(x => x.name === name)) {
      throw `No index for ${name} found!`;
    }

    return new Index<T>(this.store.index(name));
  }

  delete(key: IDBKeyRange | IDBValidKey) {
    const request = this.store.delete(key);

    return new Promise((resolve, reject) => {
      request.addEventListener('success', resolve);
      request.addEventListener('error', reject);
    });
  }

  clear() {
    const request = this.store.clear();

    return new Promise((resolve, reject) => {
      request.addEventListener('success', resolve);
      request.addEventListener('error', reject);
    });
  }

  count(key?: IDBKeyRange | IDBValidKey) {
    let request: IDBRequest = this.store.count.apply(this.store, arguments);

    return new Promise<number>((resolve, reject) => {
      request.addEventListener('success', (e: any) => resolve(e.target.result));
      request.addEventListener('error', reject);
    });
  }
}
