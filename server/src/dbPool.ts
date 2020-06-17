import { Pool, Client } from 'pg';

const pool = new Pool({ max: 4 });

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
