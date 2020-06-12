import { PoolClient } from 'pg';

interface KeyValuePair {
  key: string;
  value: string;
}

export interface DataSource {
  read: (
    path: string,
    key: string,
  ) => Promise<string | undefined> | string | undefined;

  write: (
    path: string,
    key: string,
    value: string | undefined,
  ) => Promise<void> | void;

  enumerate: (path: string) => Promise<string[]> | string[];

  throwError: () => void;

  flush: () => Promise<void> | void;
}

export interface Coder {
  encode: (value: any) => string;
  decode: (code: string) => any;
}

export class RetryError extends Error {
  constructor() {
    super('Retrying due to synchronous request missing data');
    this.name = 'RetryError';
  }
}

export class ReducerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReducerError';
  }
}

const arraysEqual = <T extends unknown>(a: T[], b: T[]): boolean => {
  if (a === b) return true;
  if (a.length != b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export const makePgSource = (client: PoolClient): DataSource => ({
  read: async (path: string, key: string) => {
    const res = await client.query(
      'SELECT value FROM kvs WHERE path=$1 AND key=$2',
      [path, key],
    );
    console.log(res);
    return 'test';
  },
  write: async (path: string, key: string, value: string | undefined) => {
    const res = await client.query(
      'INSERT INTO kvs (path, key, value) VALUES ($1, $2, $3) ON CONFLICT (path, key) DO UPDATE SET value = excluded.value',
      [path, key, value],
    );
    console.log(res);
  },
  enumerate: async (path: string) => {
    const res = await client.query('SELECT key FROM kvs WHERE path=$1', [path]);
    console.log(res);
    return ['test'];
  },
  throwError: () => undefined,
  flush: () => undefined,
});

export const makeMemorySource = (): DataSource => {
  const data: Record<string, Record<string, string | undefined>> = {};

  return {
    read: (path: string, key: string) => {
      return data[path][key];
    },
    write: (path: string, key: string, value: string | undefined) => {
      data[path][key] = value;
    },
    enumerate: (path: string) => {
      return Object.keys(data[path]);
    },
    throwError: () => undefined,
    flush: () => undefined,
  };
};

export const layerSources = (
  sourceOfTruth: DataSource,
  caches: DataSource[],
): DataSource => {
  let deferred: Promise<void>[] = [];
  let error: Error | undefined;

  return {
    read: (path: string, key: string) => {
      const cacheReads = caches.map((c) => c.read(path, key));
      const truthRead = sourceOfTruth.read(path, key);

      const resolveWith = (truth: string | undefined) => {
        cacheReads.forEach((read, index) =>
          Promise.resolve(read).then((guess) => {
            if (truth !== guess) {
              caches[index].write(path, key, truth);
            }
          }),
        );
      };

      if (truthRead instanceof Promise) {
        for (let i = 0; i < cacheReads.length; i++) {
          truthRead.then(resolveWith);

          const cr = cacheReads[i];
          if (!(cr instanceof Promise) && cr !== undefined) {
            return cr;
          }
        }

        const guessPromise = new Promise<string | undefined>(
          (resolve, reject) => {
            cacheReads.forEach((cr) =>
              Promise.resolve(cr).then((guess) => {
                if (guess !== undefined) {
                  resolve(guess);
                }
              }),
            );

            truthRead.then(
              async (truth) => {
                resolve(truth);

                const guess = await guessPromise;
                if (truth !== guess) {
                  error = new Error(
                    `Finally got truth ${truth} that did not match guess ${guess}!`,
                  );
                }
              },
              (err) => {
                reject(err);
                error = err;
              },
            );
          },
        );

        return guessPromise;
      } else {
        resolveWith(truthRead);
        return truthRead;
      }
    },

    write: (path: string, key: string, value: string | undefined) => {
      caches.forEach((c) => c.write(path, key, value));
      return sourceOfTruth.write(path, key, value);
    },

    enumerate: (path: string) => {
      const cacheReads = caches.map((c) => c.enumerate(path));
      const truthRead = sourceOfTruth.enumerate(path);

      const resolveWith = (truth: string[]) => {
        cacheReads.forEach((read, index) =>
          Promise.resolve(read).then((guess) => {
            if (truth !== guess) {
              caches[index].write(path, key, truth);
            }
          }),
        );
      };

      if (truthRead instanceof Promise) {
        for (let i = 0; i < cacheReads.length; i++) {
          truthRead.then(resolveWith);

          const cr = cacheReads[i];
          if (!(cr instanceof Promise) && cr !== undefined) {
            return cr;
          }
        }

        const guessPromise = new Promise<string | undefined>(
          (resolve, reject) => {
            cacheReads.forEach((cr) =>
              Promise.resolve(cr).then((guess) => {
                if (guess !== undefined) {
                  resolve(guess);
                }
              }),
            );

            truthRead.then(
              async (truth) => {
                resolve(truth);

                const guess = await guessPromise;
                if (truth !== guess) {
                  error = new Error(
                    `Finally got truth ${truth} that did not match guess ${guess}!`,
                  );
                }
              },
              (err) => {
                reject(err);
                error = err;
              },
            );
          },
        );

        return guessPromise;
      } else {
        resolveWith(truthRead);
        return truthRead;
      }
    },

    throwError: () => {
      if (error) {
        throw error;
      }
    },

    flush: () => {
      const jobs = deferred;
      deferred = [];
      return Promise.all(jobs).then(() => undefined);
    },
  };
};
