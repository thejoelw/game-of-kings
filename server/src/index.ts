const Server = require('boardgame.io/server').Server;
const session = require('koa-session');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');
const passport = require('koa-passport');
const Router = require('koa-router');
const LocalStrategy = require('passport-local').Strategy;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const argon2 = require('argon2');
const uuidv4 = require('uuid/v4');

const CustomMongo = require('./CustomMongo').default;
const Game = require('./Game').default;

const userCache = {};

const getUser = (ctx) => {
  if (!ctx.session.userId || !userCache[ctx.session.userId]) {
    const user = ctx.isAuthenticated()
      ? ctx.state.user
      : {
          _id: 'guest-' + uuidv4(),
          username: `guest-${uuidv4()}`,
          rating: 1500,
        };

    userCache[user._id] = user;
    ctx.session.userId = user._id;
  }

  return userCache[ctx.session.userId];
};

const externalizeUser = (user) => ({
  id: user._id,
  username: user.username,
  rating: user.rating,
});

(async () => {
  const mongoConn = await MongoClient.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  });
  const db = mongoConn.db('gliders');

  await db.collection('users').createIndex({ username: 1 }, { unique: true });

  const gameStateUpdateHandler = (state) => {
    if (state.ctx.gameover) {
      const gameId = state.gameId.split(':').pop();
      const players = games[gameId].players;

      const calcRatingChange = (myRating, opponentRating, myGameResult) => {
        const myChanceToWin =
          1 / (1 + Math.pow(10, (opponentRating - myRating) / 400));
        const delta = Math.round(64 * (myGameResult - myChanceToWin));
        return delta;
      };

      players[0].rating += calcRatingChange(
        players[0].rating,
        players[1].rating,
        state.G.winner == 0,
      );
      players[1].rating += calcRatingChange(
        players[1].rating,
        players[0].rating,
        state.G.winner == 1,
      );

      if (!players[0]._id.startsWith('guest-')) {
        db.collection('users').updateOne(
          { _id: new ObjectId(players[0]._id) },
          { $set: { rating: players[0].rating } },
        );
      }

      if (!players[1]._id.startsWith('guest-')) {
        db.collection('users').updateOne(
          { _id: new ObjectId(players[1]._id) },
          { $set: { rating: players[1].rating } },
        );
      }

      delete games[gameId];

      emitGameUpdate();
    }
  };

  const server = Server({
    games: [Game],
    db: new CustomMongo(db, gameStateUpdateHandler),
  });

  server.app.proxy = true;

  server.app.keys = ['n53QZl1x7iwAW5Na'];
  server.app.use(session({ renew: true }, server.app));

  server.app.use(bodyParser());

  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db
        .collection('users')
        .findOne({ _id: new ObjectId(id) });

      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await db.collection('users').findOne({ username });

        if (!user) {
          done(null, false, { message: 'Incorrect username' });
        } else if (!(await argon2.verify(user.passHash, password))) {
          done(null, false, { message: 'Incorrect password' });
        } else {
          done(null, user);
        }
      } catch (err) {
        done(err);
      }
    }),
  );

  server.app.use(passport.initialize());
  server.app.use(passport.session());

  const router = new Router();

  router.post('/register', async (ctx) => {
    try {
      const result = await db.collection('users').insertOne({
        username: ctx.request.body.username,
        passHash: await argon2.hash(ctx.request.body.password),
        rating: 1500,
      });

      ctx.body = { success: true };
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        // Duplicate username error
        ctx.status = 409;
        ctx.body = {
          error: {
            message: "Can't register user because username is already taken",
          },
        };
        return;
      }

      console.error(err);

      ctx.status = 500;
      ctx.body = {
        error: { message: "can't register user for some reason" },
      };
    }
  });

  router.get('/user/:username', async (ctx) => {
    const user = await db
      .collection('users')
      .findOne({ username: ctx.params.username });

    if (!user) {
      ctx.body = { error: { message: 'User does not exist' } };
      ctx.throw(404);
    } else {
      ctx.body = {
        success: true,
        user: { username: user.username, rating: user.rating },
      };
    }
  });

  const games = {};
  let gameListeners = [];
  const emitGameUpdate = () => {
    const oldListeners = gameListeners;
    gameListeners = [];
    oldListeners.forEach((cb) => cb());
  };

  router.post('/join_match/:game_id', (ctx) => {
    let game;
    if (games[ctx.params.game_id]) {
      game = games[ctx.params.game_id];
    } else {
      game = games[ctx.params.game_id] = {
        id: ctx.params.game_id,
      };
    }

    const user = getUser(ctx);

    if (!game.players) {
      game.players = [];
    }
    if (
      game.players.length < 2 &&
      !game.players.find((p) => p._id === user._id)
    ) {
      game.players.push(user);

      ctx.body = { success: true };
    } else {
      ctx.body = { success: false };
    }

    emitGameUpdate();
  });

  router.get('/lobby', async (ctx) => {
    if (parseInt(ctx.request.query.block)) {
      await new Promise((resolve) => gameListeners.push(resolve));
    }

    const user = getUser(ctx);

    ctx.body = {
      user: externalizeUser(user),
      games: Object.keys(games)
        .map((id) => games[id])
        .filter(
          (game) =>
            game.players.length < 2 ||
            game.players.find((p) => p._id === user._id),
        )
        .map((game) => ({
          ...game,
          players: game.players.map(externalizeUser),
        })),
    };
  });

  router.post('/login', passport.authenticate('local'), (ctx) => {
    ctx.session.userId = null;

    ctx.body = {
      success: true,
      user: externalizeUser(getUser(ctx)),
    };
  });

  router.get('/logout', (ctx) => ctx.logout());

  // // Require authentication for now
  // server.app.use((ctx, next) => {
  //  if (ctx.isAuthenticated()) {
  //    return next();
  //  } else {
  //    ctx.redirect('/');
  //  }
  // });

  server.app.use(router.routes());

  server.app.use(
    serve('build', {
      defer: true,
    }),
  );

  server.run(
    {
      port: process.env.PORT || 8080,
    },
    () => console.log('server running...'),
  );
})();
