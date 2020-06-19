class RemoteDatabase {
  constructor(source) {
    this.source = source;
  }

  store(key, value) {
    this.source[JSON.stringify(key)] = value;
    return Promise.resolve();
  }

  load(key) {
    return Promise.resolve(this.source[JSON.stringify(key)]);
  }
}

class MemoryDatabase {
  constructor(source) {
    this.source = source;
  }

  store(key, value) {
    this.source[JSON.stringify(key)] = value;
  }

  load(key) {
    return this.source[JSON.stringify(key)];
  }
}

const dbs = [new MemoryDatabase({}), new RemoteDatabase({})];

/*
An atomic operation:
  Updates a set of key:value pairs, iff a set of key:value pairs match a hash.
*/

const store = (path, value) => {
  switch (typeof value) {
    case 'undefined':
      return undefined;
    case 'boolean':
      return 'b';
    case 'number':
      return;
  }

  // if (typeof )

  // "undefined";
  // Null  "object" (see below)
  // Boolean  "boolean"
  // Number  "number"
  // BigInt (new in ECMAScript 2020)  "bigint"
  // String  "string"
  // Symbol (new in ECMAScript 2015)  "symbol"
  // Function object (implements [[Call]] in ECMA-262 terms)  "function"
  // Any other object  "object"
};

const load = (key) => {};

const SENTINEL_OBJECT = {};
const SENTINEL_ARRAY = {};

const run = (func) => {
  const muts = {};

  const makeMockStore = (path) =>
    new Proxy(
      {},
      {
        get: (target, key) => {
          const p = path.concat(key);
          const k = p.join('/');

          let res;
          if (k in muts) {
            res = muts[k];
          } else if (k in db) {
            res = db[k];
          }

          if (res === SENTINEL_OBJECT) {
            return makeMockStore(p);
          } else if (res === SENTINEL_ARRAY) {
            return makeMockStore(p);
          } else {
            return res;
          }
        },
        set: (target, key, value) => {
          const p = path.concat(key);
          const k = p.join('/');

          if (typeof value === 'object') {
          }

          muts[k] = value;
        },
        deleteProperty: (target, key) => {
          throw new Error(
            'Delete is not implemented; please set to undefined.',
          );
        },
        enumerate: (target, key) => {
          throw new Error('Not implemented');
          return target.keys();
        },
        ownKeys: (target, key) => {
          throw new Error('Not implemented');
          return target.keys();
        },
        has: (target, key) => {
          throw new Error('Not implemented');
          return key in target;
        },
        defineProperty: (target, key, desc) => {
          throw new Error('Not implemented');
        },
        getOwnPropertyDescriptor: (target, key) => {
          throw new Error('Not implemented');
        },
      },
    );

  func(makeMockStore([]));
};

/* Cookies test */

console.log((docCookies.my_cookie1 = 'First value'));
console.log(docCookies.getItem('my_cookie1'));

docCookies.setItem('my_cookie1', 'Changed value');
console.log(docCookies.my_cookie1);

const register = (func) => {};

// Stores access patterns for the input, predict what's going to be asked for.
// Throw exceptions if it's not there yet.
const myReducer = (
  { state: { nextEventIndex }, events, myArr, self },
  runEffector,
) => {
  const event = events[nextEventIndex];
  if (!event && !event.processed) {
    return;
  }

  runEffector(() => console.log('test'));

  return {
    // Missing keys here are ignored; not deleted.
    state: { nextEventIndex: nextEventIndex + 1 },
    events: { [nextEventIndex]: { processed: true } },
    myArr: {
      [myArr.length]: { id: uuid() },
      anotherReducer, // Only has access to myArr
    },
  };
};

const sessionDropper = (session) => {};

const dropSessions = ({ sessions }) => ({
  sessions: Object.keys(sessions).map(() => ({
    sessionDropper,
  })),
});

register(dropSessions);

register(myReducer);

/*

/state: {type: 'object', listeners: [56, 23, 13]}
/state/nextEventIndex: {type: 'number', listeners: [23, 13, 78], value: 5}

*/
