import expect from 'expect';
import { Entity } from '../../src/decorators/Entity';
import { ENTITY_SYMBOL, EntityMetadata } from '../../src/decorators/EntityMetadata';

describe('EntityMetadata', () => {
  it('should initiliaze metadata ', () => {
    const meta = new EntityMetadata();

    expect(meta.name).toBeFalsy();
    expect(meta.autoIncrement).toBeFalsy();
    expect(meta.indices).toEqual([]);
    expect(meta.keyPath).toEqual([]);
  });

  it('should apply existing metadata', () => {
    const indices = [{ name: 'bar', keyPath: ['baz'], options: {} }];
    const keyPath = ['bar', 'baz'];

    const meta = new EntityMetadata({
      name: 'foo',
      autoIncrement: true,
      indices,
      keyPath
    });

    expect(meta.name).toBe('foo');
    expect(meta.autoIncrement).toBeTruthy();
    expect(meta.indices).toEqual(indices);
    expect(meta.keyPath).toEqual(keyPath);
  });
});
