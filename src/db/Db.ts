import { EntityMetadata, ENTITY_SYMBOL } from '../decorators/EntityMetadata';
import { Transaction } from './Transaction';
import { Entity } from '../decorators/Entity';

export type Migration = (tx: Transaction) => Promise<void>;

export type Newable<T> = new (...args: any[]) => T;

export class Db {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private version: number;
  private entities: Array<Newable<any>> = [];
  private migrations = new Map<Newable<any>, Migration>();


  constructor(dbName: string, version: number) {
    this.dbName = dbName;
    this.version = version;
  }

  use(entity: Newable<any>, migration?: Migration) {
    this.entities.push(entity);

    if (migration != null) {
      this.migrations.set(entity, migration);
    }

    return this;
  }

  async transaction<T>(entities: Array<Newable<any>>, cb: (tx: Transaction) => Promise<T> | void): Promise<T>;
  async transaction<T>(entities: Array<Newable<any>>, mode: 'readonly' | 'readwrite', cb: (tx: Transaction) => Promise<T> | void): Promise<T>;
  async transaction<T>(entities: Array<Newable<any>>, arg1: any, arg2?: any) {
    if (!entities.every(x => this.entities.indexOf(x) >= 0)) {
      throw 'Some entities are not registered in db, use `db.use(entity)` to register them';
    }

    if (this.db == null) {
      this.db = await open(this.dbName, this.version, this.entities, this.migrations);
    }

    let tx: Transaction;
    let result: T;
    switch (arguments.length) {
      case 2:
        tx = new Transaction(this.db, entities, 'readonly');
        result = await arg1(tx);
        break;
      case 3:
        tx = new Transaction(this.db, entities, arg1);
        result = await arg2(tx);
        break;
      default:
        throw 'wrong count of arguments for transaction()';
    }

    await tx.completion();
    return result;
  }

  close() {
    if (this.db != null) {
      this.db.close();
    }
  }

  static deleteDatabase(dbName: string) {
    const deleteRequest = indexedDB.deleteDatabase(dbName);

    return new Promise((resolve, reject) => {
      deleteRequest.addEventListener('error', reject);
      deleteRequest.addEventListener('success', resolve);
    });
  }
}

const open = (dbName: string, version: number, entities: Array<Newable<any>>, migrations: Map<Newable<any>, Migration>) => {
  const openRequest = indexedDB.open(dbName, version);

  return new Promise<IDBDatabase>((resolve, reject) => {
    openRequest.addEventListener('error', (event) => reject(event));
    openRequest.addEventListener('success', () => resolve(openRequest.result));
    openRequest.addEventListener('upgradeneeded', (event: any) => upgradeVersion(event.target.result, entities, migrations));
  });
};

const upgradeVersion = async (db: IDBDatabase, entities: Array<Newable<any>>, migrations: Map<Newable<any>, Migration>) => {
  for (let entity of entities) {
    const { name, keyPath, autoIncrement, indices } = new EntityMetadata(Reflect.getMetadata(ENTITY_SYMBOL, entity));

    if (db.objectStoreNames.contains(name)) {
      if (!migrations.has(entity)) {
        throw 'Possible conflict found, please provide a migration for ' + name;
      }
      const migration = migrations.get(entity) !;

      // we need a UpgradeTransaction to provide createIndex and deleteIndex
      const tx = new Transaction(db, [entity], 'readwrite');
      await migration(tx);
      await tx.completion();


    } else {
      const objectStore = db.createObjectStore(name, {
        keyPath: getKeyPath(keyPath),
        autoIncrement
      });

      for (let { name, keyPath, options } of indices) {
        objectStore.createIndex(name, keyPath.length === 1 ? keyPath[0] : keyPath, options);
      }
    }
  }
};

const getKeyPath = (keyPath: Array<string>) => {
  switch (keyPath.length) {
    case 1:
      return keyPath[0];
    case 0:
      return undefined;
    default:
      return keyPath as any;
  }
};
