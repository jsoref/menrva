const Koa = require("koa");
const path = require("path");
const next = require("next");
const bodyParser = require("koa-body");
const Router = require("koa-router");
const cookie = require("koa-cookie");
const admin = require("firebase-admin");
const serviceAccount = require("../sercy-2de63-d059ec2664ae.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// var config = {
// apiKey: "AIzaSyDaSF8PfdRA1mjztmQQKWV0v6BusUjvko4",
// authDomain: "sercy-2de63.firebaseapp.com",
// databaseURL: "https://sercy-2de63.firebaseio.com",
// projectId: "sercy-2de63",
// storageBucket: "sercy-2de63.appspot.com",
// messagingSenderId: "724512766832"
// };
// firebase.initializeApp(config);

const app = next({
  dir: path.resolve(__dirname, "../"),
  dev: process.env.NODE_ENV === "development"
});
const defaultHandler = app.getRequestHandler();

const createMeta = (params, query) => {
  let meta = Object.assign({}, params, query);
  Object.keys(meta).forEach(key => {
    meta[key] = encodeURIComponent(meta[key]);
  });
  return meta;
};

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.

app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();

  server.proxy = true;
  server.use(bodyParser());
  server.use(cookie());

  router.get("/auth/github", async ctx => {
    const body = ctx.request.body;
    const { req, res, params, ip } = ctx;
    console.log("params", params);
    ctx.body = {};
    ctx.respond = true;
  });

  router.get("/auth/github/callback", async ctx => {
    const body = ctx.request.body;
    const { req, res, params, ip } = ctx;
    console.log(params);
    ctx.body = {};
    ctx.respond = true;
  });

  // router.post("/auth/github", async ctx => {
  // const body = ctx.request.body;
  // const { req, res, params, ip } = ctx;
  // console.log(params);
  // ctx.body = {};
  // ctx.respond = true;
  // });

  // Create token for user
  router.post("/api/token/", async ctx => {
    const { req, res } = ctx;
    console.log("create token", req.user);
  });

  router.get("/api/token/", async ctx => {
    const { req, res } = ctx;
    let idToken;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      idToken = req.headers.authorization.split("Bearer ")[1];
    } else if (req.cookies) {
      console.log('Found "__session" cookie');
      // Read the ID Token from cookie.
      idToken = req.cookies.__session;
    } else {
      // No cookie
      ctx.res.statusCode = 403;
      ctx.body = "Unauthorized";
      return;
    }
    console.log("id token", idToken);
  });

  router.post("/api/:token/upload", async ctx => {
    const body = ctx.request.body;
    const { req, res, params, ip } = ctx;
    console.log("token", params.token);
    // const result = await apis.comment(
    // Object.assign(body, {
    // ip: ip,
    // id: params.id,
    // ua: req.headers["user-agent"]
    // }),
    // res,
    // req.method
    // );
    ctx.body = {};
    ctx.respond = true;
  });

  router.get("*", async ctx => {
    const { req, res, params, query } = ctx;
    let { path } = ctx.request;
    const length = path.length;

    if (path[length - 1] === "/") {
      path = path.substr(0, length - 1);
    }

    await defaultHandler(req, res);
    ctx.respond = false;
  });

  server.use(async (ctx, next) => {
    ctx.res.statusCode = 200;
    await next();
  });

  server.use(async (ctx, next) => {
    const { req, request, cookies, res, params, query } = ctx;

    if (!request.path.startsWith("/api/")) {
      await next();
      return;
    }

    console.log("Check if request is authorized with Firebase ID token");
    console.log(req.headers, req.cookies, request.headers, request.cookies);
    if (
      (!req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer ")) &&
      !(cookies && cookies.__session)
    ) {
      console.error(
        "No Firebase ID token was passed as a Bearer token in the Authorization header.",
        "Make sure you authorize your request by providing the following HTTP header:",
        "Authorization: Bearer <Firebase ID Token>",
        'or by passing a "__session" cookie.'
      );
      // ctx.res.statusCode = 403;
      // ctx.res.body = "Unauthorized";
      // return;
    }

    let idToken;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      console.log('Found "Authorization" header');
      // Read the ID Token from the Authorization header.
      idToken = req.headers.authorization.split("Bearer ")[1];
    } else if (cookies) {
      console.log('Found "__session" cookie');
      // Read the ID Token from cookie.
      idToken = cookies.__session;
    } else {
      // No cookie
      // ctx.res.statusCode = 403;
      // ctx.res.body = "Unauthorized";
      // return;
    }

    console.log(idToken);
    try {
      const decodedIdToken = admin
        .auth()
        .verifyIdToken(idToken)
        .then(async decodedIdToken => {});
      console.log("ID Token correctly decoded", decodedIdToken);
      ctx.req.user = decodedIdToken;
    } catch (error) {
      // console.error("Error while verifying Firebase ID token:", error);
      // ctx.res.statusCode = 403;
      // ctx.res.body = "Unauthorized";
    }

    await next();
  });

  server.use(router.routes());

  server.listen(3000, err => {
    if (err) {
      throw err;
    }
    console.log(`> Ready`);
  });
});
