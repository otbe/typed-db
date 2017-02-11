import expect from 'expect';
import { ENTITY_SYMBOL, EntityMetadata } from '../../src/decorators/EntityMetadata';
import { Key } from '../../src/decorators/Key';

describe('@Key', () => {
  it('simple primary key', () => {
    class Test {
      @Key()
      id: number;
    }

    const meta = new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, Test));

    expect(meta).toBeTruthy();
    expect(meta.keyPath).toBeTruthy();
    expect(meta.keyPath).toContain('id');
    expect(meta.autoIncrement).toBeFalsy();
  });

  it('simple primary key with options', () => {
    class Test {
      @Key({ autoIncrement: true })
      id: number;
    }

    const meta = new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, Test));

    expect(meta).toBeTruthy();
    expect(meta.keyPath).toBeTruthy();
    expect(meta.keyPath).toContain('id');
    expect(meta.autoIncrement).toBeTruthy();
  });

  it('compound key', () => {
    class Test {
      @Key()
      id: number;

      @Key()
      date: number;
    }

    const meta = new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, Test));

    expect(meta).toBeTruthy();
    expect(meta.keyPath).toBeTruthy();
    expect(meta.keyPath).toContain('id');
    expect(meta.keyPath).toContain('date');
    expect(meta.autoIncrement).toBeFalsy();
  });
});
