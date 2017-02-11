import expect from 'expect';
import { Entity } from '../../src/decorators/Entity';
import { ENTITY_SYMBOL, EntityMetadata } from '../../src/decorators/EntityMetadata';

describe('@Entity (js)', () => {
  it('should apply metadata', () => {
    @Entity()
    class Test {}

    const meta = new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, Test));

    expect(meta).toBeTruthy();
    expect(meta.name).toBe('Test');
  });
});
