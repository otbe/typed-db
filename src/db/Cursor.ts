export class Cursor<T> {
  private cursor: IDBCursorWithValue;

  constructor(cursor: IDBCursorWithValue) {
    this.cursor = cursor;
  }

  get value(): T {
    return this.cursor.value;
  }

  continue(key?: IDBKeyRange | IDBValidKey) {
    return this.cursor.continue.apply(this.cursor, arguments);
  }

  advance(count: number) {
    return this.cursor.advance(count);
  }
}
