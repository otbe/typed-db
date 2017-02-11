# typed-db
[![Build Status](https://travis-ci.org/otbe/typed-db.svg?branch=master)](https://travis-ci.org/otbe/typed-db)

```typed-db``` is a small promise-based entity manager for IndexedDB written entirely in TypeScript. 
In general it exposes almost the same API as the native IndexedDB factory, but all available methods are wrapped in promises.
Additionally it allows you to define your entities in a more declarative way.

```typescript
@Entity()
class Employee {
  @Key({ autoIncrement: true })
  id?: number;

  name: string;

  @Index()
  age: number;

  @Index()
  salary: number;
}

const db = new Db('myDb', 1);
db.use(Employee);

const getAllEmployees = () => 
  db.transaction([Employee], 'readonly', 
    tx => tx.for(Employee).openCursor().asList()
  );

getAllEmployees().then(employees => {
  console.log('Transaction has finished successfully.');
  console.log(employees);
})
```
For more query examples see ```tests/Db.ts``` :)

## Install
Your environment needs support for the [Reflect Metadata API](https://rbuckton.github.io/reflect-metadata/), so install a proper polyfill alongside ```typed-db``` if you haven't already one :)
```
$ npm install typed-db reflect-metadata --save
```
or
```
$ yarn add typed-db reflect-metadata
```

Additionally you will need a Promise polyfill, Map polyfill and some ES2015 array functions (e.g. find).
```babel-polyfill``` satisfies all this requirements :)


## API

### ```Db```
Creates the database object, opens the connection if needed and let you register your entities.

```typescript
// pass in database name and version
const db = new Db('dbname', 1);
db.use(Foo);
```

If you increase the version number, you have to add migrations for you entites. 
See the migration guide for an example. (TODO)

Create a transaction:
```typescript
// pass in an array of entities which are in the same transaction scope
// set the mode of the transaction, supported: readwrite | readonly
// callback with transaction (tx), return value auf this function will be the result of the transaction, can be async
db.transaction([Foo], 'readwrite', tx => {...});
```

### ```@Entity```

```typescript
function Entity(): ClassDecorator;
```

Sets up a class to be used as a collection.

### ```@Key```

```typescript
function Key(options?: KeyOptions): PropertyDecorator;
```

Indentifies a property as a primary key of the entity.
You can create compound keys by applying ```@Key``` multiple times.
In this case the optional ```options``` object is omitted.

### ```@Index```

Creates an index for the property its applied on.
```typescript
function Index(): PropertyDecorator;
function Index(options: IDBIndexParameters): PropertyDecorator;
function Index(key: string): PropertyDecorator;
function Index(key: string, options: IDBIndexParameters): PropertyDecorator;
```
This decorator has multiple overloads, for examle you can create a named
index by applying ```@Index('myIndex')``` or set some options ```@Index({ unique: true })```.

You can easily create an compound index by using the same name for multiple properties:
```typescript
@Entity()
class Foo {
  @Index('compoundIndex')
  age: number;

  @Index('compoundIndex')
  salary: number;
}
```

## Contribution
File an issue or place a PR if you want to :)






