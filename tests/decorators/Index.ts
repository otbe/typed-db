import * as expect from 'expect';
import { ENTITY_SYMBOL, EntityMetadata } from '../../src/decorators/EntityMetadata';
import { Index } from '../../src/decorators/Index';

describe('@Index', () => {
  it('simple index', () => {
    class Test {
      @Index()
      foo: string;
    }

    const meta = new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, Test));

    expect(meta).toBeTruthy();
    expect(meta.indices).toContain({ name: 'foo', keyPath: ['foo'], options: {} });
  });

  it('simple index with options', () => {
    class Test {
      @Index({ unique: true })
      foo: string;
    }

    const meta = new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, Test));

    expect(meta).toBeTruthy();
    expect(meta.indices).toContain({ name: 'foo', keyPath: ['foo'], options: { unique: true } });
  });

  it('named index', () => {
    class Test {
      @Index('bar')
      foo: string;
    }

    const meta = new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, Test));

    expect(meta).toBeTruthy();
    expect(meta.indices).toContain({ name: 'bar', keyPath: ['foo'], options: {} });
  });

  it('named index with options', () => {
    class Test {
      @Index('bar', { unique: true })
      foo: string;
    }

    const meta = new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, Test));

    expect(meta).toBeTruthy();
    expect(meta.indices).toContain({ name: 'bar', keyPath: ['foo'], options: { unique: true } });
  });

  it('compound index', () => {
    class Test {
      @Index('bar')
      foo: string;

      @Index('bar')
      baz: number;
    }

    const meta = new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, Test));

    expect(meta).toBeTruthy();
    expect(meta.indices).toContain({ name: 'bar', keyPath: ['foo', 'baz'], options: {} });
  });

  it('compound index with options', () => {
    class Test {
      @Index('bar', { unique: true })
      foo: string;

      @Index('bar')
      baz: number;
    }

    const meta = new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, Test));

    expect(meta).toBeTruthy();
    expect(meta.indices).toContain({ name: 'bar', keyPath: ['foo', 'baz'], options: { unique: true } });
  });
});
