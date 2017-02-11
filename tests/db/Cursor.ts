import expect, { createSpy, Spy } from 'expect';
import { Cursor } from '../../src/db/Cursor';

describe('Cursor', () => {
  it('should let me use the wrapped IDBCursor', () => {
    const fakeCursor = {
      value: 10,
      continue: createSpy(),
      advance: createSpy()
    } as any as IDBCursorWithValue;

    const cursor = new Cursor<number>(fakeCursor);

    expect(cursor.value).toBe(10);

    cursor.continue();
    expect(fakeCursor.continue).toHaveBeenCalled();

    (fakeCursor.continue as Spy<any>).reset();

    cursor.continue('foo');
    expect(fakeCursor.continue).toHaveBeenCalledWith('foo');

    cursor.advance(40);
    expect(fakeCursor.advance).toHaveBeenCalledWith(40);
  });
});
