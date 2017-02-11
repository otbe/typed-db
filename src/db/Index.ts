import { Cursor } from './Cursor';
import { createObservable, Observable } from '../utils/Observable';
import { createCursorResult } from '../utils/CursorResult';

export class Index<T> {
  private index: IDBIndex;

  constructor(index: IDBIndex) {
    this.index = index;
  }

  count(key?: IDBKeyRange | IDBValidKey) {
    let request: IDBRequest = this.index.count.apply(this.index, arguments);

    return new Promise<number>((resolve, reject) => {
      request.addEventListener('success', (e: any) => resolve(e.target.result));
      request.addEventListener('error', reject);
    });
  }

  get(key: IDBKeyRange | IDBValidKey) {
    let request = this.index.get(key);

    return new Promise<T>((resolve, reject) => {
      request.addEventListener('success', (e: any) => resolve(e.target.result));
      request.addEventListener('error', reject);
    });
  }

  getKey(key: IDBKeyRange | IDBValidKey) {
    let request = this.index.getKey(key);

    return new Promise((resolve, reject) => {
      request.addEventListener('success', (e: any) => resolve(e.target.result));
      request.addEventListener('error', reject);
    });
  }

  openCursor(range?: IDBKeyRange | IDBValidKey, direction?: string) {
    let request = this.index.openCursor.apply(this.index, arguments);

    return createCursorResult<T>(request);
  }
}
