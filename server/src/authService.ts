import passport from 'koa-passport';
import { Strategy as LocalStrategy } from 'passport-local';
import argon2 from 'argon2';

import pool from './dbPool';

passport.serializeUser((user: { id: string }, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM users WHERE id = $1`, [id]);

    if (res.rows.length === 1) {
      const user = res.rows[0];
      return done(null, user);
    }

    return done(null, false);
  } catch (err) {
    return done(err);
  } finally {
    client.release();
  }
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT * FROM users WHERE username = $1`,
        [username],
      );

      if (res.rows.length === 1) {
        const user = res.rows[0];

        if (await argon2.verify(user.password_hash, password)) {
          return done(null, user);
        }
      }

      return done(null, false);
    } catch (err) {
      return done(err);
    } finally {
      client.release();
    }
  }),
);

/*
passport.serializeUser((user: { id: string }, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `
INSERT INTO users (username, auth_type, auth_external_id)
VALUES ()
ON CONFLICT (id) DO UPDATE   SET column_1 = excluded.column_1,       column_2 = excluded.column_2`,
      [id],
    );
    console.log(res.rows[0]);

    done(null, res.rows[0]);
  } catch (err) {
    done(err);
  } finally {
    // Make sure to release the client before any error handling,
    // just in case the error handling itself throws an error.
    client.release();
  }
});
*/

// export default authService = {
//   decodeToken: (header: string) => Promise.resolve({ uid: '123' }),
// };

export default passport;
