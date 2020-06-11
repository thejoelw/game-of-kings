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

  enumerate: (path: string) => Promise<KeyValuePair[]> | KeyValuePair[];

  throwError: () => void;

  flush: () => Promise<void> | void;
}

export const makePgSource = (client: PoolClient): DataSource => ({
  read: async (key: string) => {
    const res = await client.query('SELECT value FROM kvs WHERE k=$1', [key]);
    console.log(res);
    return 'test';
  },
  write: async (key: string, value: string | undefined) => {
    const res = await client.query(
      'INSERT INTO kvs (path, key, value) VALUES ($1, $2, $3) ON CONFLICT (path, key) DO UPDATE SET value = excluded.value',
      [key, value],
    );
    console.log(res);
  },
  throwError: () => undefined,
  flush: () => undefined,
});

export const makeMemorySource = (): DataSource => {
  const data: Record<string, string | undefined> = {};

  return {
    read: (key: string) => {
      return data[key];
    },
    write: (key: string, value: string | undefined) => {
      data[key] = value;
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
    read: (key: string) => {
      const cacheReads = caches.map((c) => Promise.resolve(c.read(key)));
      const truthRead = Promise.resolve(sourceOfTruth.read(key));

      const guessPromise = new Promise<string | undefined>(
        (resolve, reject) => {
          cacheReads.forEach((c) =>
            c.then((guess) => {
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

              cacheReads.forEach((read, index) =>
                read.then((guess) => {
                  if (truth !== guess) {
                    caches[index].write(key, truth);
                  }
                }),
              );
            },
            (err) => {
              reject(err);
              error = err;
            },
          );
        },
      );

      return guessPromise;
    },

    write: (key: string, value: string | undefined) => {
      caches.forEach((c) => c.write(key, value));
      return sourceOfTruth.write(key, value);
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
