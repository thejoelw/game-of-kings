import { DataSource, Coder, RetryError, ReducerError } from './DataSource';

export const proxyFactory = (path: string, ds: DataSource, coder: Coder) =>
  new Proxy(
    {},
    {
      get: (target: {}, key: string) => {
        const res = ds.read(path, key);
        if (res instanceof Promise) {
          throw new RetryError();
        } else {
          return res && coder.decode(res);
        }
      },

      set: (target: {}, key: string, value: any) => {
        throw new ReducerError(`Reducers must NOT try to mutate their input.`);
      },

      deleteProperty: (target: {}, key: string) => {
        throw new ReducerError(`Reducers must NOT try to mutate their input.`);
      },

      enumerate: (target: {}) => {
        const res = ds.enumerate(path);
        if (res instanceof Promise) {
          throw new RetryError();
        } else {
          return res;
        }
      },

      ownKeys: (target: {}) => {
        const res = ds.enumerate(path);
        if (res instanceof Promise) {
          throw new RetryError();
        } else {
          return res;
        }
      },

      has: (target: {}, key: string) => {
        const res = ds.read(path, key);
        if (res instanceof Promise) {
          throw new RetryError();
        } else {
          return res !== undefined;
        }
      },

      defineProperty: (target: {}, key: string, desc: PropertyDescriptor) => {
        throw new ReducerError(`Reducers must NOT try to mutate their input.`);
      },

      getOwnPropertyDescriptor: (target: {}, key: string) => {
        const res = ds.read(path, key);
        if (res instanceof Promise) {
          throw new RetryError();
        } else {
          return res
            ? {
                value: coder.decode(res),
                writable: false,
                enumerable: true,
                configurable: false,
              }
            : undefined;
        }
      },
    },
  );
