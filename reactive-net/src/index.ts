import { Pool, Client } from 'pg';

import proxyFactory from './proxyFactory';
import { DataSource, RetryError, makePgSource } from './DataSource';

export type DbConfig = {
  hostname: string;
  database: string;
};

const Network = ({  }: {} = {}) => {
  const pool = new Pool({ max: 4 });

  const register = (mapper: (state: any) => any) => {
    let backoff = 0;

    const run = async () => {
      const client = await pool.connect();

      const concurrentQueries = [];
      const source = makePgSource(client);

      const set = (path: string[], value: any) => {
        let enc: string | undefined;

        switch (typeof value) {
          case 'bigint':
            enc = 'i' + value.toString();
            break;

          case 'boolean':
            enc = value ? 'b1' : 'b0';
            break;

          case 'number':
            enc = 'n' + value.toString();
            break;

          case 'object':
            if (Array.isArray(value)) {
              enc = 'a' + value.length.toString();
            } else {
              enc = 'o' + JSON.stringify(Object.keys(value));
            }
            Object.entries(value).forEach(([k, v]) => set([...path, k], v));
            break;

          case 'string':
            enc = 's' + value;
            break;

          case 'symbol':
            throw new Error(`Symbols are not supported`);

          case 'function':
            throw new Error(`Still working on inline registration`);
            break;

          case 'undefined':
            enc = undefined;
            break;
        }

        const res = source.write(JSON.stringify(path), enc);
        if (res instanceof Promise) {
          concurrentQueries.push(res);
        }
      };

      try {
        await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

        const proxy = proxyFactory(source);

        const res = await mapper(proxy);
        source.throwError();

        set([], res);
        source.throwError();

        source.flush();
        source.throwError();

        await client.query('COMMIT');

        backoff /= 2;
      } catch (e) {
        await client.query('ROLLBACK');
        if (e instanceof RetryError) {
          setTimeout(run, backoff);
          backoff *= 1.5;
          backoff += 100;
        } else {
          throw e;
        }
      } finally {
        client.release();
      }
    };
  };

  const close = async () => {
    await pool.end();
  };

  return { register, close };
};

export default Network;

// PGUSER=dbuser PGHOST=database.server.com PGPASSWORD=secretpassword PGDATABASE=mydb PGPORT=3211 node script.js

const net = Network();

net.register(({ inc, counter }: { inc: number; counter: number }) => ({
  inc: 0,
  counter: counter + inc,
}));
