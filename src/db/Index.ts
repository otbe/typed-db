import { Cursor } from './Cursor';
import { createObservable } from '../utils/Observable';

export class Index<T> {
  private index: IDBIndex;

  constructor(index: IDBIndex) {
    this.index = index;
  }

  count(key?: IDBKeyRange | IDBValidKey) {
    return new Promise<number>((resolve, reject) => {
      let request: IDBRequest = this.index.count.apply(this.index, arguments);
      request.addEventListener('success', (e: any) => resolve(e.target.result));
      request.addEventListener('error', reject);
    });
  }

  get(key: IDBKeyRange | IDBValidKey) {
    return new Promise<T>((resolve, reject) => {
      let request = this.index.get(key);
      request.addEventListener('success', (e: any) => resolve(e.target.result));
      request.addEventListener('error', reject);
    });
  }

  getKey(key: IDBKeyRange | IDBValidKey) {
    return new Promise((resolve, reject) => {
      let request = this.index.getKey(key);
      request.addEventListener('success', (e: any) => resolve(e.target.result));
      request.addEventListener('error', reject);
    });
  }

  openCursor(range?: IDBKeyRange | IDBValidKey, direction?: string) {
    let request = this.index.openCursor.apply(this.index, arguments);

    const result = {
      asObservable: () => createObservable<Cursor<T>>(subscriber => {
        request.addEventListener('success', (e: any) => {
          const cursor: IDBCursorWithValue = e.target.result;

          if (cursor == null) {
            return subscriber.complete();
          }

          subscriber.next(new Cursor<T>(cursor));
        });

        request.addEventListener('error', (e: any) => subscriber.error(e));
      }),
      asList: async () => {
        const list: Array<T> = [];

        return new Promise<Array<T>>((resolve, reject) => {
          result.asObservable().subscribe(
            cursor => {
              list.push(cursor.value);
              cursor.continue();
            },
            reject,
            () => resolve(list)
          );
        });
      }
    };

    return result;
  }
}
