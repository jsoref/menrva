const Koa = require("koa");
const path = require("path");
const next = require("next");
const bodyParser = require("koa-body");
const Router = require("koa-router");
const cookie = require("koa-cookie").default;
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccount.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

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

  router.use(cookie());
  router.use(async (ctx, next) => {
    const { req, request, cookies, res, params, query } = ctx;

    if (!request.path.startsWith("/api/")) {
      await next();
      return;
    }

    console.log("Check if request is authorized with Firebase ID token");
    console.log("cookies", cookies);
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
    } else if (cookies && cookies.__session) {
      console.log('Found "__session" cookie', cookies.__session);
      // Read the ID Token from cookie.
      idToken = cookies.__session;
    } else {
      // No cookie
      // ctx.res.statusCode = 403;
      // ctx.res.body = "Unauthorized";
      // return;
    }

    try {
      const decodedIdToken = await admin.auth().verifyIdToken(idToken);

      console.log("ID Token correctly decoded", decodedIdToken);
      ctx.user = decodedIdToken;
    } catch (error) {
      console.error("Error while verifying Firebase ID token");
      // ctx.res.statusCode = 403;
      // ctx.res.body = "Unauthorized";
    }

    await next();
  });

  // Create token for user
  router.post("/api/token/", async ctx => {
    const { req, res } = ctx;
    console.log("create token", ctx.user, req.user);
  });

  router.get("/api/token/", async ctx => {
    const { req, res, user } = ctx;
    console.log("user", user);
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

  server.use(router.routes());

  server.listen(3000, err => {
    if (err) {
      throw err;
    }
    console.log(`> Ready`);
  });
});
