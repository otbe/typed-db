import * as expect from 'expect';
import { Db } from '../src/db/Db';
import { Entity } from '../src/decorators/Entity';
import { Key } from '../src/decorators/Key';
import { Index } from '../src/decorators/Index';
import { intersectionWith, isEqual, omit } from 'lodash';

const dbName = 'foo';

describe('Db', () => {
  beforeEach(async () => {
    try {
      await Db.deleteDatabase(dbName);
    } catch (e) { console.log(e); }
  });

  it('basic CRUD example', async () => {

    @Entity()
    class Test {
      @Key({ autoIncrement: true })
      id?: string;

      name: string;
    }

    const db = new Db(dbName, 1);
    db.use(Test);

    const id = await db.transaction([Test], 'readwrite', (tx) => {
      return tx.for(Test).add({ name: 'foo' });
    });

    expect(id).toBeTruthy();

    let numberOfRows = await db.transaction([Test], 'readonly', (tx) => {
      return tx.for(Test).count();
    });

    expect(numberOfRows).toBe(1);

    const entity = await db.transaction([Test], 'readonly', (tx) => {
      return tx.for(Test).get(id);
    });

    expect(entity).toEqual({ id, name: 'foo' });

    await db.transaction([Test], 'readwrite', (tx) => {
      return tx.for(Test).put({ ...entity, name: 'bar' });
    });

    const updatedEntity = await db.transaction([Test], 'readonly', (tx) => {
      return tx.for(Test).get(id);
    });

    expect(updatedEntity).toEqual({ id, name: 'bar' });

    const count = await db.transaction([Test], 'readwrite', (tx) => {
      return tx.for(Test).delete(id);
    });

    numberOfRows = await db.transaction([Test], 'readonly', (tx) => {
      return tx.for(Test).count();
    });

    expect(numberOfRows).toBe(0);

    db.close();
  });

  it('basic CRUD example (one transaction)', async () => {

    @Entity()
    class Test {
      @Key({ autoIncrement: true })
      id?: string;

      name: string;
    }

    const db = new Db(dbName, 1);
    db.use(Test);

    const id = await db.transaction([Test], 'readwrite', (tx) => {
      return tx.for(Test).add({ name: 'foo' });
    });

    const txResult = await db.transaction([Test], 'readwrite', async (tx) => {
      expect(await tx.for(Test).count()).toBe(1);

      const entity = await tx.for(Test).get(id);
      expect(entity).toEqual({ id, name: 'foo' });

      await tx.for(Test).put({ ...entity, name: 'bar' });

      expect(await tx.for(Test).get(id)).toEqual({ id, name: 'bar' });

      await tx.for(Test).delete(id);

      return tx.for(Test).count();
    });

    expect(txResult).toBe(0);

    db.close();
  });

  it('basic cursor example', async () => {

    @Entity()
    class Test {
      @Key({ autoIncrement: true })
      id?: string;

      name: string;
    }

    const db = new Db(dbName, 1);
    db.use(Test);

    await db.transaction([Test], 'readwrite', async (tx) => {
      await tx.for(Test).add({ name: 'foo' });
      await tx.for(Test).add({ name: 'bar' });
      await tx.for(Test).add({ name: 'baz' });
    });

    const list = await db.transaction([Test], 'readonly', async (tx) => {
      const list: Array<Test> = [];
      return new Promise<Array<Test>>(resolve => {
        tx.for(Test)
          .openCursor()
          .asCursor()
          .subscribe((cursor) => {
            list.push(cursor.value);
            cursor.continue();
          },
          () => { },
          () => resolve(list));
      });
    });

    expect(list.length).toBe(3);
    expect(list).toInclude({ id: 1, name: 'foo' });
    expect(list).toInclude({ id: 2, name: 'bar' });
    expect(list).toInclude({ id: 3, name: 'baz' });

    db.close();
  });

  it('index example', async () => {

    @Entity()
    class Employee {
      @Key({ autoIncrement: true })
      id?: string;

      @Index()
      age: number;

      @Index()
      salary: number;
    }

    const db = new Db(dbName, 1);
    db.use(Employee);

    await db.transaction([Employee], 'readwrite', async (tx) => {
      await tx.for(Employee).add({ age: 20, salary: 2000 });
      await tx.for(Employee).add({ age: 25, salary: 3000 });
      await tx.for(Employee).add({ age: 30, salary: 4000 });
    });

    expect(await db.transaction([Employee], 'readonly', (tx) => {
      const index = tx.for(Employee).index('age');
      return index.count(IDBKeyRange.lowerBound(25));
    })).toBe(2);

    expect(await db.transaction([Employee], 'readonly', (tx) => {
      const index = tx.for(Employee).index('age');
      return index.count(IDBKeyRange.lowerBound(20));
    })).toBe(3);

    expect(await db.transaction([Employee], 'readonly', (tx) => {
      const index = tx.for(Employee).index('age');
      return index.count(IDBKeyRange.bound(22, 27));
    })).toBe(1);

    // get all employees between age 22 and 35 AND salary between 2500 to 5000
    const result = await db.transaction([Employee], 'readonly', async (tx) => {
      const resultGroup1 = await tx.for(Employee).index('age').openCursor(IDBKeyRange.bound(22, 35)).asList();
      const resultGroup2 = await tx.for(Employee).index('salary').openCursor(IDBKeyRange.bound(2500, 5000)).asList();

      // only pick objects that are in both groups and omit 'id' for easier assertion
      return intersectionWith(resultGroup1, resultGroup2, isEqual).map(x => omit(x, 'id'));
    });

    expect(result.length).toBe(2);
    expect(result).toInclude({ age: 25, salary: 3000 });
    expect(result).toInclude({ age: 30, salary: 4000 });

    db.close();
  });

  it('compound key example', async () => {

    @Entity()
    class Employee {
      @Key()
      id: number;

      @Key()
      name: string;
    }

    const db = new Db(dbName, 1);
    db.use(Employee);

    await db.transaction([Employee], 'readwrite', async (tx) => {
      await tx.for(Employee).add({ id: 1, name: 'foo' });
      await tx.for(Employee).add({ id: 2, name: 'bar' });
      await tx.for(Employee).add({ id: 3, name: 'foo' });
    });

    expect(await db.transaction([Employee], 'readonly', tx => tx.for(Employee).get([1, 'foo']))).toBeTruthy();
    expect(await db.transaction([Employee], 'readonly', tx => tx.for(Employee).get([3, 'foo']))).toBeTruthy();
    expect(await db.transaction([Employee], 'readonly', tx => tx.for(Employee).get([2, 'bar']))).toBeTruthy();
    expect(await db.transaction([Employee], 'readonly', tx => tx.for(Employee).get([1, 'bar']))).toBeFalsy();

    db.close();
  });

  it('compound index example', async () => {

    @Entity()
    class Employee {
      @Key({ autoIncrement: true })
      id?: number;

      @Index('compoundKey')
      age: number;

      @Index('compoundKey')
      salary: number;
    }

    const db = new Db(dbName, 1);
    db.use(Employee);

    await db.transaction([Employee], 'readwrite', async (tx) => {
      await tx.for(Employee).add({ age: 20, salary: 2000 });
      await tx.for(Employee).add({ age: 25, salary: 3000 });
      await tx.for(Employee).add({ age: 30, salary: 4000 });
    });

    expect(
      await db.transaction([Employee], 'readonly',
        tx =>
          tx.for(Employee)
            .index('compoundKey')
            .count(IDBKeyRange.lowerBound([20, 3000])))
    ).toBe(2);

    expect(
      await db.transaction([Employee], 'readonly',
        tx =>
          tx.for(Employee)
            .index('compoundKey')
            .count(IDBKeyRange.upperBound([25, 2500])))
    ).toBe(1);

    // indices are ORed together, so this will be: age 25 to 25 OR salary 2500 to 3500
    expect(
      await db.transaction([Employee], 'readonly',
        tx =>
          tx.for(Employee)
            .index('compoundKey')
            .count(IDBKeyRange.bound([25, 2500], [25, 3500])))
    ).toBe(1);

    expect(
      await db.transaction([Employee], 'readonly',
        tx =>
          tx.for(Employee)
            .index('compoundKey')
            .count(IDBKeyRange.bound([20, 3000], [30, 3000])))
    ).toBe(1);

    db.close();
  });
});
