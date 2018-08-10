const path = require("path");

const Koa = require("koa");
const next = require("next");
const bodyParser = require("koa-body");
const Router = require("koa-router");
const cookie = require("koa-cookie").default;
const uuidv4 = require("uuid/v4");

const admin = require("./admin");
const apiAuth = require("./middleware/apiAuth");

const getRepos = require("./api/getRepos");
const getBuildsForRepo = require("./api/getBuildsForRepo");
const getBuildDetails = require("./api/getBuildDetails");
const updateBuild = require("./api/updateBuild");
const uploadFiles = require("./api/uploadFiles");
const githubHooksHandler = require("./hooks/github");
const compareImagesForBuild = require("./api/compareImagesForBuild");
const endGithubCheck = require("./api/endGithubCheck");
const getTravisBuild = require("./api/getTravisBuild");
const approveBuild = require("./api/approveBuild");

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
  router.use(apiAuth());

  // Create token for user
  router.post("/api/token", async ctx => {
    const { user } = ctx;

    if (!user) {
      ctx.res.statusCode = 403;
      return;
    }

    const docRef = admin.firestore().doc(`/users/${user.user_id}`);
    const token = uuidv4();
    await docRef.set({
      writeToken: token,
    });
    ctx.res.statusCode = 200;
    ctx.body = {
      token,
    };

    console.log("created token", token, user.name);
  });

  router.get("/api/token", async ctx => {
    const { user } = ctx;

    const tokensDoc = admin.firestore().doc(`/users/${user.user_id}`);
    const token = await tokensDoc.get();
    ctx.body = {
      token: (token.exists && token.data().writeToken) || null,
    };
  });

  // API endpoint to list an array of unique repo names
  router.get("/api/repos", async ctx => {
    ctx.body = await getRepos();
  });

  router.post("/api/user", async ctx => {
    const { request, user } = ctx;
    const { body } = request;
    console.log("create user", user);

    if (!user) {
      ctx.status = 403;
      return;
    }

    admin
      .firestore()
      .doc(`/users/${user.user_id}`)
      .set({
        user_id: user.user_id,
        githubToken: body.githubToken,
        providerId: body.userInfo.providerId,
        username: body.userInfo.username,
        profile: body.userInfo.profile,
      });
  });

  // API endpoint to get a list of builds
  // take a router param repo
  // list from collection builds that match repo passed as param
  router.get("/api/builds/:owner/:repo", async ctx => {
    const { params } = ctx;
    ctx.body = await getBuildsForRepo(params);
  });

  // API endpoint to get build details
  router.get("/api/build/:owner/:repo/:build", async ctx => {
    const { params } = ctx;
    ctx.body = await getBuildDetails({ ...params, withParent: true });
  });

  router.post("/api/build/:owner/:repo/:build/approve", async ctx => {
    const { params } = ctx;
    approveBuild(params);
  });

  router.post("/build/upload", async ctx => {
    const { request } = ctx;
    const { files, body, query } = request;
    const { token } = query;
    const { testName, ...restBody } = body;

    // TODO check if token is valid
    const uploadedFiles = await uploadFiles(files, testName);
    await updateBuild(body.job, { files: uploadedFiles, ...restBody, token });

    ctx.body = {};
    ctx.respond = true;
  });

  router.post("/build/upload-finish", async (ctx, next) => {
    const { request } = ctx;
    const { body } = request;
    const [owner, repo] = body.repo.split("/");

    ctx.respond = true;
    next();

    // kick off image processing for build
    const didComparePass = await compareImagesForBuild({
      ...body,
      owner,
      repo,
    });

    await updateBuild(body.job, {
      status: didComparePass ? "passed" : "failed",
    });
    const travis = getTravisBuild({
      owner,
      repo,
      build: body.job,
    });

    endGithubCheck(travis.check_run_id, body.repo, didComparePass);
    // update github app
  });

  router.post("/github/hooks", async ctx => {
    await githubHooksHandler(ctx);
    // ctx.body = {};
    ctx.respond = true;
  });

  router.get("/github/setup", async ctx => {
    const { req, request, res } = ctx;
    const { query } = request;
    console.log("github setup", query);

    if (query.setup_action === "install") {
      // install github
      // save user + installation_id
    }

    await defaultHandler(req, res);
    ctx.respond = false;
  });

  // debugging
  router.post("/github/*", async ctx => {
    const { request } = ctx;
    const { body, path } = request;
    console.log("github route hit", path, body);

    ctx.res.statusCode = 500;
    // ctx.body = {};
    ctx.respond = true;
  });

  router.get("*", async ctx => {
    const { req, res } = ctx;
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
