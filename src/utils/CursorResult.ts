import { createObservable, Observable } from './Observable';
import { Cursor } from '../db/Cursor';

export const createCursorResult = <T>(request: IDBRequest) => {
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
};
