const path = require("path");

const Koa = require("koa");
const next = require("next");
const bodyParser = require("koa-body");
const Router = require("koa-router");
const cookie = require("koa-cookie").default;
const uuidv4 = require("uuid/v4");

const admin = require("./admin");
const githubHooksHandler = require("./hooks/github");

const bucket = admin.storage().bucket();

const app = next({
  dir: path.resolve(__dirname, "../"),
  dev: process.env.NODE_ENV === "development",
});
const defaultHandler = app.getRequestHandler();

app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();

  server.proxy = true;
  server.use(
    bodyParser({
      multipart: true,
    })
  );

  router.use(cookie());

  // Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
  // The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
  // `Authorization: Bearer <Firebase ID Token>`.
  // when decoded successfully, the ID Token content will be added as `req.user`.
  router.use(async (ctx, next) => {
    const { req, request, cookie, res, params, query } = ctx;

    if (!request.path.startsWith("/api/")) {
      await next();
      return;
    }

    console.log("Check if request is authorized with Firebase ID token");
    // console.log("cookies", cookies);
    if (
      (!req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer ")) &&
      !(cookie && cookie.session)
    ) {
      console.error(
        "No Firebase ID token was passed as a Bearer token in the Authorization header.",
        "Make sure you authorize your request by providing the following HTTP header:",
        "Authorization: Bearer <Firebase ID Token>",
        'or by passing a "session" cookie.'
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
    } else if (cookie && cookie.session) {
      console.log('Found "session" cookie', cookie.session);
      // Read the ID Token from cookie.
      idToken = cookie.session;
    } else {
      // No cookie
      // ctx.res.statusCode = 403;
      // ctx.res.body = "Unauthorized";
      // return;
    }

    try {
      const decodedIdToken = await admin.auth().verifyIdToken(idToken);

      console.log("ID Token correctly decoded, userid: ", decodedIdToken);
      console.log(decodedIdToken.firebase.identities["github.com"][0]);
      ctx.user = decodedIdToken;
    } catch (error) {
      console.error("Error while verifying Firebase ID token", error);
      // ctx.res.statusCode = 403;
      // ctx.res.body = "Unauthorized";
    }

    await next();
  });

  // Create token for user
  router.post("/api/token/", async ctx => {
    const { req, res, user } = ctx;

    if (!user) {
      ctx.res.statusCode = 403;
      return;
    }

    const tokensDoc = admin.firestore().doc("/users/write-tokens");
    const tokens = await tokensDoc.get();
    console.log(tokens.length);
    const token = uuidv4();
    const resp = await tokensDoc.set({
      user: user.uid,
      token,
    });
    console.log(resp);
    ctx.res.statusCode = 200;
    ctx.body = {
      token,
    };

    console.log("created token", token, user.name);
  });

  router.get("/api/token/", async ctx => {
    const { req, res, user } = ctx;

    const tokensDoc = admin.firestore().doc("/users/write-tokens");
    const token = await tokensDoc.get();
    ctx.body = {
      token: (token.exists && token.data().token) || null,
    };
  });

  router.post("/api/build/:build/upload", async ctx => {
    const { req, request, res, params, ip } = ctx;
    console.log("upload", request.body, request.params, request.files);
    bucket.upload(request.files.file.path, function(err, file, apiResponse) {
      // Your bucket now contains:
      // - "image.png" (with the contents of `/local/path/image.png')
      // console.log("File:", file);
      console.log("Uploaded!");
      console.log("error:", err);
      // `file` is an instance of a File object that refers to your new file.
    });
    ctx.body = {};
    ctx.respond = true;
  });

  router.post("/api/build/:build/upload-finish", async ctx => {
    const { request } = ctx;
    const { query } = request;
    const { token } = query;
    // kick off image processing for build
  });

  router.post("/github/hooks", async ctx => {
    const { req, request, res, params, ip } = ctx;
    const { body, path } = request;
    await githubHooksHandler(ctx);
    // ctx.body = {};
    ctx.respond = true;
  });

  // debugging
  router.post("/github/*", async ctx => {
    const { req, request, res, params, ip } = ctx;
    const { body, path } = request;
    console.log("github route hit", path, body);

    ctx.res.statusCode = 500;
    // ctx.body = {};
    ctx.respond = true;
  });

  router.get("/github/setup", async ctx => {
    const { req, request, res, params, ip } = ctx;
    const { body, path, query } = request;
    console.log("github setup", query);

    if (query.setup_action === "install") {
      // install github
      // save user + installation_id
    }

    await defaultHandler(req, res);
    ctx.respond = false;
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
